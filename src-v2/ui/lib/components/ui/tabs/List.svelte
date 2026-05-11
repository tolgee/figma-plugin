<script lang="ts">
	import type { Snippet } from "svelte";
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$ui/lib/utils";

	type Props = TabsPrimitive.ListProps & { children?: Snippet };
	let { class: className, children, ...rest }: Props = $props();
</script>

<TabsPrimitive.List
	{...rest}
	class={cn(
		"inline-flex items-center gap-1 border-b border-[var(--color-border)]",
		className,
	)}
>
	{@render children?.()}
</TabsPrimitive.List>
