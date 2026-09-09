<script lang="ts">
  import { Switch as SwitchPrimitive } from "bits-ui";
  import { cn } from "$ui/lib/utils";

  type Props = {
    checked?: boolean;
    onCheckedChange?: (v: boolean) => void;
    disabled?: boolean;
    class?: string;
    id?: string;
  };
  let {
    checked = $bindable(false),
    onCheckedChange,
    disabled,
    class: className,
    id,
  }: Props = $props();
</script>

<SwitchPrimitive.Root
  bind:checked
  {onCheckedChange}
  {disabled}
  {id}
  class={cn(
    // Solid grey OFF track (a plain bg-secondary fill blends into the panel);
    // brand fill when ON. Kept prominent so the state reads at a glance.
    "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full bg-icon-muted transition-colors data-[state=checked]:bg-bg-brand disabled:opacity-60",
    className,
  )}
>
  <SwitchPrimitive.Thumb
    class="block h-3.5 w-3.5 rounded-full bg-white shadow-sm translate-x-0.5 data-[state=checked]:translate-x-[17px] transition-transform"
  />
</SwitchPrimitive.Root>
