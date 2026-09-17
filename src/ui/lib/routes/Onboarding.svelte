<script lang="ts">
  import type { TolgeeConfig } from "$shared/types";
  import { ICON } from "$shared/iconSizes";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { send } from "$ui/lib/bus";
  import { Button } from "$ui/lib/components/ui";
  import ArrowRight from "lucide-svelte/icons/arrow-right";
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import Check from "lucide-svelte/icons/check";
  import SettingsSectionConnection from "$ui/lib/components/domain/SettingsSectionConnection.svelte";
  import SettingsSectionProject from "$ui/lib/components/domain/SettingsSectionProject.svelte";
  import SettingsSectionKeys from "$ui/lib/components/domain/SettingsSectionKeys.svelte";
  import SettingsSectionSync from "$ui/lib/components/domain/SettingsSectionSync.svelte";
  import SettingsSectionPush from "$ui/lib/components/domain/SettingsSectionPush.svelte";

  const DEFAULT_API_URL = "https://app.tolgee.io";

  // First-run guided setup. Deliberately the SAME sections Settings uses,
  // one step at a time — no duplicated fields, so a settings change lands here
  // too. Matches the original plugin's stepped setup (Project → Strings → Push).
  // Titles mirror the Settings tabs exactly — onboarding walks the same three
  // sections, so it reads as "you're filling in Settings", not a separate flow.
  const TITLES = ["Project", "Strings and Keys", "Upload options"] as const;
  // Compact stepper labels: Settings-aligned but shortened to fit one line.
  // "Upload options" (not "Upload") so the step reads as settings, not an action
  // — the actual upload lives on its own screen (Push.svelte, "Upload to Tolgee").
  const STEP_LABELS = ["Project", "Strings & Keys", "Upload options"] as const;
  let step = $state(0);

  // Same form snapshot + defaults as Settings, so the sections behave
  // identically and the final Save writes exactly what Settings would.
  const cfg = appState.value.config ?? {};
  let form = $state<Partial<TolgeeConfig>>({
    ...cfg,
    apiUrl: cfg.apiUrl ?? DEFAULT_API_URL,
    apiKey: cfg.apiKey ?? "",
    namespace: cfg.namespace ?? "",
    language: cfg.language ?? "",
    ignorePrefix: cfg.ignorePrefix ?? "_",
  });

  // Can't move past "Connect" until the credentials actually validated —
  // everything downstream (languages, namespaces, push tags) needs a project.
  const canAdvance = $derived(step > 0 || auth.value.authenticated);

  function next(): void {
    if (step < TITLES.length - 1) step += 1;
    else finish();
  }
  function back(): void {
    if (step > 0) step -= 1;
  }

  function finish(): void {
    // Identical to Settings.save: persist, mirror locally, land on Index.
    // `save-config` stamps documentInfo on the main side, so this first-run
    // gate won't fire again for this document.
    send({ type: "save-config", config: form });
    appState.setConfig({ ...(appState.value.config ?? {}), ...form });
    appState.navigate({ name: "index" });
  }
</script>

<div class="flex h-full flex-col">
  <header
    class="shrink-0 border-b border-border bg-linear-to-b from-bg to-header-gradient-end px-3 pb-3 pt-4"
  >
    <!-- No title/logo here — Figma's own plugin chrome already shows the
         Tolgee logo + name above this iframe. Just the stepper. -->
    <!-- Simple stepper: numbered circles joined by ONE rounded connector each,
         UPPERCASE titles below. Each column owns the connector reaching back to
         the previous circle (a single line, not two half-lines meeting mid-gap),
         positioned to align with the 24px circle's vertical centre. -->
    <div class="flex px-2 py-1.5">
      {#each STEP_LABELS as label, i (i)}
        <div class="relative flex flex-1 flex-col items-center">
          {#if i > 0}
            <!-- Single connector from the previous circle to this one, inset a
                 few px from both so it never touches the circles. Its left edge
                 reaches half a column back (-50%) to the previous centre. -->
            <div
              class="absolute left-[calc(-50%+16px)] top-3 h-0.5 w-[calc(100%-32px)] -translate-y-1/2 rounded-full transition-colors"
              class:bg-bg-brand={i <= step}
              class:bg-border={i > step}
            ></div>
          {/if}
          <div
            class="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors"
            class:border-transparent={i <= step}
            class:bg-bg-brand={i <= step}
            class:text-text-onbrand={i <= step}
            class:border-border={i > step}
            class:bg-bg={i > step}
            class:text-text-secondary={i > step}
          >
            {#if i < step}
              <Check size={13} />
            {:else}
              {i + 1}
            {/if}
          </div>
          <span
            class="mt-2 text-center text-[11px] uppercase leading-tight tracking-wide"
            class:font-semibold={i <= step}
            class:text-text={i <= step}
            class:text-text-secondary={i > step}
          >
            {label}
          </span>
        </div>
      {/each}
    </div>
  </header>

  <div class="min-h-0 flex-1 space-y-6 overflow-auto p-3">
    {#if step === 0}
      <SettingsSectionConnection bind:form persistDisconnect={false} />
      {#if auth.value.authenticated}
        <!-- Language + namespace appear once connected, like the original. -->
        <SettingsSectionProject bind:form hideDisabledNotes />
      {/if}
    {:else if step === 1}
      <SettingsSectionKeys bind:form />
      <SettingsSectionSync bind:form />
    {:else}
      <SettingsSectionPush bind:form />
    {/if}
  </div>

  <footer class="flex shrink-0 items-center justify-between border-t border-border p-3">
    {#if step > 0}
      <Button variant="ghost" size="sm" onclick={back}>
        <ArrowLeft size={ICON.inline} /> Back
      </Button>
    {:else}
      <span></span>
    {/if}
    <Button size="sm" disabled={!canAdvance} onclick={next}>
      {#if step === TITLES.length - 1}
        Save
      {:else}
        Next <ArrowRight size={ICON.inline} />
      {/if}
    </Button>
  </footer>
</div>
