<script lang="ts">
  // Inline per-language sample values on a copy row — see `copySamples.ts`.
  // Enter or leaving a field saves, Esc restores. One edit applies to every
  // text with the same key on this copy page.
  import type { NodeInfo } from "$shared/types";
  import { Input } from "$ui/lib/components/ui";
  import { requestPageConnectedNodes } from "$ui/lib/api/pageNodes";
  import { applyTranslationsRequest } from "$ui/lib/logic/copyApply";
  import {
    type SampleField,
    buildSampleUpdates,
    invalidSample,
    sameKey,
    sampleFields,
  } from "$ui/lib/logic/copySamples";

  type Props = { node: NodeInfo; language: string };
  let { node, language }: Props = $props();

  const fields = $derived(sampleFields(node));
  // Local drafts, re-seeded whenever the node's stored values change (after a
  // save the App patches the selection with the written snapshot).
  let drafts = $state<Record<string, string>>({});
  $effect(() => {
    drafts = Object.fromEntries(fields.map((f) => [f.name, f.value]));
  });

  let status = $state<"idle" | "saving" | "done" | "error">("idle");
  let message = $state<string | null>(null);

  async function save(field: SampleField): Promise<void> {
    const value = drafts[field.name] ?? "";
    if (value === field.value) return;
    const invalid = invalidSample(field, value);
    if (invalid) {
      status = "error";
      message = invalid;
      return;
    }
    status = "saving";
    message = null;
    try {
      // Every text with this key on the copy page — a full read of the page's
      // connected texts (1–2 s on a very large copy), only when saving.
      const onPage = await requestPageConnectedNodes();
      const targets = onPage.filter((n) => n.connected && sameKey(n, node));
      const { updates, failed } = buildSampleUpdates(
        targets.length > 0 ? targets : [node],
        { [field.name]: value },
        language,
      );
      if (updates.length === 0) {
        status = "error";
        message = "Couldn't render the text with this value.";
        return;
      }
      const result = await applyTranslationsRequest(updates);
      if (!result.ok) {
        status = "error";
        message = result.errors[0] ?? "Saving failed.";
        return;
      }
      status = "done";
      message =
        updates.length > 1 ? `Applied to ${updates.length} texts` : null;
      if (failed > 0) message = `${message ? `${message}, ` : ""}${failed} skipped`;
    } catch (err) {
      status = "error";
      message = err instanceof Error ? err.message : "Saving failed.";
    }
  }

  function onKeydown(e: KeyboardEvent, field: SampleField): void {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.currentTarget as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      drafts = { ...drafts, [field.name]: field.value };
      status = "idle";
      message = null;
      (e.currentTarget as HTMLInputElement).blur();
    }
  }
</script>

{#if fields.length > 0}
  <div class="space-y-1">
    {#each fields as field (field.name)}
      <label class="flex items-center gap-1.5 text-xs text-text-secondary">
        <span class="shrink-0">{field.name}</span>
        <Input
          class="h-6 min-w-0 flex-1"
          value={drafts[field.name] ?? ""}
          inputmode={field.plural ? "numeric" : "text"}
          disabled={status === "saving"}
          aria-label="Sample value for {field.name}"
          oninput={(e) => {
            drafts = { ...drafts, [field.name]: (e.currentTarget as HTMLInputElement).value };
            if (status === "error") {
              status = "idle";
              message = null;
            }
          }}
          onblur={() => void save(field)}
          onkeydown={(e) => onKeydown(e, field)}
        />
      </label>
    {/each}
    {#if status === "saving"}
      <p class="text-[10px] text-text-secondary">Saving…</p>
    {:else if message}
      <p class="text-[10px] {status === 'error' ? 'text-(--figma-color-text-danger)' : 'text-text-secondary'}">{message}</p>
    {/if}
  </div>
{/if}
