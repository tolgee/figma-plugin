<script lang="ts">
  import { ICON } from "$shared/iconSizes";
  import Button from "$ui/lib/components/ui/button.svelte";
  import Tolgee from "$ui/lib/components/icons/Tolgee.svelte";
  import Figma from "lucide-svelte/icons/figma";
  import ArrowRight from "lucide-svelte/icons/arrow-right";

  /**
   * The canonical Upload / Download action button.
   *
   * Locks in one shape for the two data-transfer actions so they always read
   * the same: a label, an arrow pointing at the destination's brand mark
   * ("Upload → Tolgee", "Download → Figma"). Always use this component for
   * these actions — never hand-roll the label/icon combo.
   *
   *  - `direction="upload"`   → primary button, text "Upload", → Tolgee mark.
   *  - `direction="download"` → secondary button, text "Download", → Figma mark.
   */
  type Props = {
    direction: "upload" | "download";
    onclick?: () => void;
    disabled?: boolean;
    class?: string;
    /** Optional count chip (e.g. how many keys this action will sync). */
    badge?: number;
  };
  let {
    direction,
    onclick,
    disabled,
    class: className,
    badge,
  }: Props = $props();

  const isUpload = $derived(direction === "upload");
</script>

<Button
  size="lg"
  variant={isUpload ? "default" : "secondary"}
  {onclick}
  {disabled}
  class={className}
>
  {isUpload ? "Upload" : "Download"}
  <span class="flex items-center gap-1">
    <ArrowRight size={14} />
    {#if isUpload}
      <Tolgee size={20} />
    {:else}
      <Figma size={ICON.action} />
    {/if}
  </span>
  {#if badge !== undefined}
    <!-- High-contrast count chip — white on the brand/secondary button. -->
    <span
      class="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-semibold leading-none text-text-brand"
    >
      {badge}
    </span>
  {/if}
</Button>
