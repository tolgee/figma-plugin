<script lang="ts">
  import { formatIcuMessage } from "$shared/icu";
  import { sanitizeIcuPreview } from "$ui/lib/logic/sanitizeIcuPreview";
  import { cn } from "$ui/lib/utils";

  type Props = {
    translation: string;
    params: Record<string, string>;
    language: string;
    /** Extra classes on the grey box — e.g. `h-full` to match a sibling's
     *  height in the side-by-side params+preview layout. */
    class?: string;
  };
  let { translation, params, language, class: className }: Props = $props();

  const preview = $derived(
    formatIcuMessage(translation, params, language || "en"),
  );
  // `preview.result` comes straight from the connected Tolgee project (any
  // translator can write it) and is never HTML-escaped by `formatIcuMessage`
  // — sanitize before it ever reaches `{@html ...}`, only whitelisted
  // formatting tags survive as real elements. See `sanitizeIcuPreview.ts`.
  const safeResult = $derived(sanitizeIcuPreview(preview.result));
</script>

<div class={cn("rounded bg-bg-secondary px-2 py-1 text-xs", className)}>
  <div class="text-[10px] text-text-secondary mb-0.5">Preview</div>
  <div class="whitespace-pre-wrap wrap-break-word">{@html safeResult}</div>
  {#if preview.error}
    <div class="text-[10px] text-(--figma-color-text-danger) mt-1">
      ICU error: {preview.error.message}
    </div>
  {/if}
</div>
