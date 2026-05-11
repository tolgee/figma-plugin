<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLLabelAttributes } from "svelte/elements";
	import { cn } from "$ui/lib/utils";

	type Props = HTMLLabelAttributes & { children?: Snippet };
	let { class: className, children, ...rest }: Props = $props();
</script>

<label
	{...rest}
	class={cn("text-xs font-medium text-[var(--color-text)]", className)}
>
	{@render children?.()}
</label>
