<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$ui/lib/utils";

  type Props = { children?: Snippet; class?: string };
  let { children, class: className }: Props = $props();
</script>

<div class={cn("border border-border rounded-md bg-bg p-3", className)}>
  {@render children?.()}
</div>
