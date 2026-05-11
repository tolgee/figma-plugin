<script lang="ts">
	import type { Snippet } from "svelte";
	import { Tooltip as TooltipPrimitive } from "bits-ui";
	import { cn } from "$ui/lib/utils";

	type Props = TooltipPrimitive.ContentProps & { children?: Snippet };
	let {
		class: className,
		children,
		sideOffset = 4,
		...rest
	}: Props = $props();
</script>

<TooltipPrimitive.Portal>
	<TooltipPrimitive.Content
		{sideOffset}
		{...rest}
		class={cn(
			"z-50 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-text)] shadow-md",
			className,
		)}
	>
		{@render children?.()}
	</TooltipPrimitive.Content>
</TooltipPrimitive.Portal>
