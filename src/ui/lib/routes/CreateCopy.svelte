<script lang="ts">
  import type { components } from "$ui/lib/api/schema.generated";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { send, on, nextCorrelationId } from "$ui/lib/bus";
  import { Button, Card, Label } from "$ui/lib/components/ui";
  import { fetchAllTranslations } from "$ui/lib/api/pull";
  import ArrowLeft from "lucide-svelte/icons/arrow-left";

  type Mode = "keys" | "languages";
  type Stage = "idle" | "fetching" | "creating" | "done" | "error";
  type LanguageModel = components["schemas"]["LanguageModel"];

  // ---- Local state ----------------------------------------------------------

  let mode = $state<Mode>("keys");
  let selectedLangs = $state<string[]>([]);
  let stage = $state<Stage>("idle");
  let progress = $state<{
    current: number;
    total: number;
    phase: string;
  } | null>(null);
  let errorMsg = $state<string | null>(null);
  let availableLanguages = $state<LanguageModel[]>([]);
  let languagesLoaded = $state(false);

  // ---- Derived --------------------------------------------------------------

  const cfg = $derived(appState.value.config ?? {});
  // Only forward `branch` when the project has branching enabled — otherwise
  // Tolgee 400s the translations endpoint with feature_not_enabled_for_project.
  const branch = $derived(auth.value.branchingEnabled ? cfg.branch : undefined);
  // When the document opts in to namespaces, only the configured one is
  // relevant for the copy. Otherwise pull the default namespace (`""`).
  const namespaces = $derived<string[]>(cfg.namespace ? [cfg.namespace] : [""]);

  // ---- Helpers --------------------------------------------------------------

  function toggleLang(code: string): void {
    selectedLangs = selectedLangs.includes(code)
      ? selectedLangs.filter((l) => l !== code)
      : [...selectedLangs, code];
  }

  function cancel(): void {
    appState.navigate({ name: "index" });
  }

  /**
   * Load the project's available languages from Tolgee. Only fetched once per
   * mount — switching modes shouldn't re-request.
   */
  async function ensureLanguagesLoaded(): Promise<void> {
    if (languagesLoaded) return;
    const client = auth.value.client;
    if (!client) return;

    try {
      const { data } = await client.GET("/v2/projects/languages", {
        params: { query: { size: 1000 } },
      });
      availableLanguages = data?._embedded?.languages ?? [];
      languagesLoaded = true;
    } catch {
      // Non-fatal: the picker simply stays empty. The Create button is gated
      // by `selectedLangs.length` so the user can't submit an empty payload.
      availableLanguages = [];
      languagesLoaded = true;
    }
  }

  // Trigger the languages fetch as soon as the user picks the languages mode.
  $effect(() => {
    if (mode === "languages") {
      void ensureLanguagesLoaded();
    }
  });

  /**
   * Build the per-language translations map the main thread expects. Keyed by
   * `${ns}|${key}` so the handler can match cloned nodes (which have fresh
   * IDs) back to the persisted Tolgee key + namespace.
   */
  function buildTranslationsMap(
    keys: Awaited<ReturnType<typeof fetchAllTranslations>>,
    languages: string[],
  ): Record<string, Record<string, string>> {
    const map: Record<string, Record<string, string>> = {};
    for (const lang of languages) {
      const perLang: Record<string, string> = {};
      for (const k of keys) {
        const idx = `${k.keyNamespace ?? ""}|${k.keyName}`;
        const text = k.translations[lang]?.text;
        if (text) {
          perLang[idx] = text;
        }
      }
      map[lang] = perLang;
    }
    return map;
  }

  /**
   * Drive a `create-copy` request through the bus. Returns when the main
   * thread emits a `create-copy-result` with the matching correlation ID.
   */
  function dispatchCreate(payload: {
    correlationId: string;
    mode: Mode;
    languages?: string[];
    translations?: Record<string, Record<string, string>>;
  }): Promise<{ ok: boolean; error?: string }> {
    return new Promise((resolve) => {
      const offProgress = on("create-copy-progress", (m) => {
        if (m.correlationId !== payload.correlationId) return;
        progress = { current: m.current, total: m.total, phase: m.phase };
      });
      const offResult = on("create-copy-result", (m) => {
        if (m.correlationId !== payload.correlationId) return;
        offProgress();
        offResult();
        resolve({ ok: m.ok, error: m.error });
      });
      send({
        type: "create-copy",
        correlationId: payload.correlationId,
        mode: payload.mode,
        languages: payload.languages,
        translations: payload.translations,
      });
    });
  }

  async function start(): Promise<void> {
    errorMsg = null;

    if (mode === "keys") {
      stage = "creating";
      progress = { current: 0, total: 1, phase: "writing-keys" };
      const result = await dispatchCreate({
        correlationId: nextCorrelationId(),
        mode: "keys",
      });
      if (result.ok) {
        stage = "done";
        send({ type: "notify", text: "Created keys page." });
        appState.navigate({ name: "index" });
      } else {
        stage = "error";
        errorMsg = result.error ?? "Unknown error";
      }
      return;
    }

    // mode === "languages"
    const client = auth.value.client;
    if (!client) {
      stage = "error";
      errorMsg = "Not connected to Tolgee.";
      return;
    }
    if (selectedLangs.length === 0) return;

    stage = "fetching";
    progress = null;

    let translationsMap: Record<string, Record<string, string>>;
    try {
      const keys = await fetchAllTranslations(client, {
        languages: selectedLangs,
        namespaces,
        branch: branch || undefined,
      });
      translationsMap = buildTranslationsMap(keys, selectedLangs);
    } catch (e) {
      stage = "error";
      errorMsg = e instanceof Error ? e.message : String(e);
      return;
    }

    stage = "creating";
    progress = {
      current: 0,
      total: selectedLangs.length * 100,
      phase: "writing",
    };

    const result = await dispatchCreate({
      correlationId: nextCorrelationId(),
      mode: "languages",
      languages: selectedLangs,
      translations: translationsMap,
    });
    if (result.ok) {
      stage = "done";
      send({
        type: "notify",
        text: `Created ${selectedLangs.length} language page(s).`,
      });
      appState.navigate({ name: "index" });
    } else {
      stage = "error";
      errorMsg = result.error ?? "Unknown error";
    }
  }

  // ---- UI flags -------------------------------------------------------------

  const isBusy = $derived(stage === "creating" || stage === "fetching");
  const canSubmit = $derived(
    !isBusy && (mode === "keys" || selectedLangs.length > 0),
  );
</script>

<div class="flex h-full flex-col">
  <header
    class="flex items-center justify-between border-b border-border px-3 py-2"
  >
    <div class="flex items-center gap-2">
      <button
        type="button"
        onclick={cancel}
        aria-label="Back"
        class="text-text-secondary hover:text-text"
      >
        <ArrowLeft size={14} />
      </button>
      <h1 class="text-sm font-semibold">Create copy</h1>
    </div>
  </header>

  <div class="flex-1 overflow-auto p-3 space-y-3">
    {#if stage === "idle"}
      <Card>
        <Label>Mode</Label>
        <div class="mt-2 space-y-1">
          <label class="flex items-center gap-2 text-xs">
            <input type="radio" bind:group={mode} value="keys" />
            Create page with key names
          </label>
          <label class="flex items-center gap-2 text-xs">
            <input type="radio" bind:group={mode} value="languages" />
            Create page per language
          </label>
        </div>
      </Card>

      {#if mode === "languages"}
        <Card>
          <Label>Languages</Label>
          {#if !languagesLoaded}
            <p class="mt-2 text-[11px] text-text-secondary">
              Loading languages…
            </p>
          {:else if availableLanguages.length === 0}
            <p class="mt-2 text-[11px] text-text-secondary">
              No languages available.
            </p>
          {:else}
            <div class="mt-2 max-h-48 overflow-auto space-y-1">
              {#each availableLanguages as lang (lang.id)}
                <label class="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedLangs.includes(lang.tag)}
                    onchange={() => toggleLang(lang.tag)}
                  />
                  <span>{lang.name}</span>
                  <span class="text-text-secondary">
                    ({lang.tag})
                  </span>
                </label>
              {/each}
            </div>
          {/if}
        </Card>
      {/if}
    {:else if stage === "fetching"}
      <Card>
        <p class="text-xs text-text-secondary">
          Loading translations from Tolgee…
        </p>
      </Card>
    {:else if stage === "creating"}
      <Card>
        <p class="text-xs">
          Creating copy…
          {#if progress && progress.total > 0}
            <span class="text-text-secondary">
              ({progress.current} / {progress.total})
            </span>
          {/if}
        </p>
      </Card>
    {:else if stage === "error"}
      <div
        class="rounded border border-(--figma-color-border-danger) bg-(--figma-color-bg-danger-tertiary) p-2 text-xs text-(--figma-color-text-danger)"
      >
        {errorMsg ?? "Something went wrong."}
      </div>
    {/if}
  </div>

  <footer class="flex justify-end gap-2 border-t border-border p-2">
    <Button variant="ghost" onclick={cancel}>Cancel</Button>
    <Button onclick={start} disabled={!canSubmit}>Create</Button>
  </footer>
</div>
