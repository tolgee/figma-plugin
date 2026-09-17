<script lang="ts">
  // A single summary statistic: a prominent number above a small label. One
  // place so every stat block matches (font sizes + weight). `tone` colours the
  // value; the label is always the muted secondary text at the same size.
  // Used for the Push New / Changed / Unchanged breakdown.
  //
  // Pass `onclick` to make it an interactive button (e.g. scroll to its section)
  // with a hover affordance; without it the stat is plain static text.
  type Tone = "default" | "brand" | "secondary" | "muted";
  type Props = {
    value: number | string;
    label: string;
    tone?: Tone;
    onclick?: () => void;
  };
  let { value, label, tone = "default", onclick }: Props = $props();

  const TONE: Record<Tone, string> = {
    default: "text-text",
    brand: "text-text-brand",
    secondary: "text-secondary",
    muted: "text-text-secondary",
  };
</script>

{#if onclick}
  <button
    type="button"
    {onclick}
    class="rounded text-center transition-colors hover:bg-bg {TONE[tone]}"
  >
    <div class="text-lg font-semibold">{value}</div>
    <div class="text-xs">{label}</div>
  </button>
{:else}
  <div class="text-center {TONE[tone]}">
    <div class="text-lg font-semibold">{value}</div>
    <div class="text-xs">{label}</div>
  </div>
{/if}
