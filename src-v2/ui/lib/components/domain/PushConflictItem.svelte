<script lang="ts">
  import Select from "$ui/lib/components/ui/select.svelte";
  import type { PushConflictResolution } from "$ui/lib/logic/pushFlow";

  export type { PushConflictResolution };

  type Props = {
    keyName: string;
    keyNamespace?: string;
    language: string;
    /** New translation we want to push (sourced from the Figma node). */
    figmaText: string;
    /** Existing translation on the server. */
    remoteText: string;
    /** Whether the server marked this conflict as overridable. */
    isOverridable: boolean;
    /** Current resolution selection. */
    resolution: PushConflictResolution;
    onResolutionChange: (
      keyName: string,
      ns: string | undefined,
      resolution: PushConflictResolution,
    ) => void;
  };

  let {
    keyName,
    keyNamespace,
    language,
    figmaText,
    remoteText,
    isOverridable,
    resolution,
    onResolutionChange,
  }: Props = $props();

  const options = $derived(
    isOverridable
      ? [
          { value: "OVERRIDE", label: "Override" },
          { value: "KEEP", label: "Keep" },
          { value: "FORCE_OVERRIDE", label: "Force override" },
        ]
      : [
          { value: "KEEP", label: "Keep" },
          { value: "FORCE_OVERRIDE", label: "Force override" },
        ],
  );

  function handleChange(value: string): void {
    onResolutionChange(keyName, keyNamespace, value as PushConflictResolution);
  }
</script>

<div
  class="grid grid-cols-[1fr_1fr_auto] items-start gap-2 border-b border-[var(--color-border)] py-2 last:border-b-0"
>
  <div class="min-w-0">
    <div
      class="truncate text-[10px] font-medium text-[var(--color-text-secondary)]"
      title={keyNamespace ? `${keyNamespace}.${keyName}` : keyName}
    >
      {keyNamespace ? `${keyNamespace}.${keyName}` : keyName}
      <span class="opacity-70">· {language}</span>
    </div>
    <div
      class="mt-0.5 line-clamp-2 text-xs whitespace-pre-wrap break-words text-[var(--color-text)]"
      title={figmaText}
    >
      {figmaText || "(empty)"}
    </div>
    <div class="mt-1 text-[10px] text-[var(--color-text-secondary)]">Figma</div>
  </div>

  <div class="min-w-0">
    <div
      class="line-clamp-2 text-xs whitespace-pre-wrap break-words text-[var(--color-text)]"
      title={remoteText}
    >
      {remoteText || "(empty)"}
    </div>
    <div class="mt-1 text-[10px] text-[var(--color-text-secondary)]">
      Tolgee
    </div>
  </div>

  <div class="flex-shrink-0">
    <Select
      value={resolution}
      options={options}
      onChange={handleChange}
      class="min-w-[120px]"
    />
  </div>
</div>
