<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";
	import { cn } from "$ui/lib/utils";

	type Props = HTMLInputAttributes & { class?: string };
	let {
		class: className,
		value = $bindable(""),
		...rest
	}: Props = $props();
</script>

<input
	bind:value
	{...rest}
	class={cn(
		"h-7 px-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-xs focus:outline-none focus:border-[var(--color-border-brand)] placeholder:text-[var(--color-text-secondary)]",
		className,
	)}
/>
