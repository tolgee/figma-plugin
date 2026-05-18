<script lang="ts">
  import IcuTextarea from "$ui/lib/components/domain/IcuTextarea.svelte";

  type Props = {
    value: string;
    onChange?: (next: string) => void;
    nested?: boolean;
    /** Kept for API compatibility — no longer has an effect. */
    placeholders?: "initial" | "full" | "none";
    placeholder?: string;
    rows?: number;
    class?: string;
    id?: string;
    disabled?: boolean;
  };

  let {
    value = $bindable(""),
    onChange,
    nested = false,
    placeholders: _placeholders = "full",
    placeholder = "",
    rows = 3,
    class: className = "",
    id,
    disabled = false,
  }: Props = $props();
</script>

<IcuTextarea
  bind:value
  {onChange}
  {nested}
  {placeholder}
  {rows}
  class={className}
  {id}
  {disabled}
/>
