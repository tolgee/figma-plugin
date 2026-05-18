<script lang="ts">
  import { cn } from "$ui/lib/utils";

  type Option = { value: string; label: string };
  type Props = {
    value?: string;
    options: Option[];
    placeholder?: string;
    disabled?: boolean;
    onChange?: (v: string) => void;
    class?: string;
    id?: string;
  };
  let {
    value = $bindable(""),
    options,
    placeholder,
    disabled,
    onChange,
    class: className,
    id,
  }: Props = $props();
</script>

<select
  {id}
  bind:value
  {disabled}
  onchange={(e) => onChange?.((e.currentTarget as HTMLSelectElement).value)}
  class={cn(
    "h-7 px-2 rounded border border-border bg-bg text-text text-xs focus:outline-none focus:border-border-brand disabled:opacity-50",
    className,
  )}
>
  {#if placeholder}
    <option value="" disabled>{placeholder}</option>
  {/if}
  {#each options as opt (opt.value)}
    <option value={opt.value}>{opt.label}</option>
  {/each}
</select>
