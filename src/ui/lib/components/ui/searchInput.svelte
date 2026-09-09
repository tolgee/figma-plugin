<script lang="ts">
  // Search field used across the plugin: a magnifying-glass on the left and,
  // once there's a value, a clear "✕" on the right that empties the box. Wraps
  // the base Input so the icon padding and clear behaviour live in one place.
  import { ICON } from "$shared/iconSizes";
  import { cn } from "$ui/lib/utils";
  import Input from "./input.svelte";
  import Search from "lucide-svelte/icons/search";
  import X from "lucide-svelte/icons/x";

  type Props = {
    value: string;
    placeholder?: string;
    class?: string;
  };

  let { value = $bindable(""), placeholder, class: className }: Props = $props();
</script>

<div class={cn("relative", className)}>
  <Search
    size={ICON.inline}
    class="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary"
  />
  <Input bind:value {placeholder} class="w-full pl-7 pr-7" />
  {#if value}
    <button
      type="button"
      aria-label="Clear search"
      onclick={() => (value = "")}
      class="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-text-secondary transition-colors hover:text-text-brand"
    >
      <X size={ICON.inline} />
    </button>
  {/if}
</div>
