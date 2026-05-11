<script lang="ts">
  import { formatIcuMessage } from "$shared/icu";

  type Props = {
    translation: string;
    params: Record<string, string>;
    language: string;
  };
  let { translation, params, language }: Props = $props();

  const preview = $derived(
    formatIcuMessage(translation, params, language || "en"),
  );
</script>

<div class="px-2 py-1 bg-[var(--color-bg-secondary)] rounded text-xs">
  <div class="text-[10px] text-[var(--color-text-secondary)] mb-0.5">
    Preview
  </div>
  <div class="whitespace-pre-wrap break-words">{preview.result}</div>
  {#if preview.error}
    <div class="text-[10px] text-[var(--figma-color-text-danger)] mt-1">
      ICU error: {preview.error.message}
    </div>
  {/if}
</div>
