<script lang="ts">
	import type { Snippet } from "svelte";
	import { getContext } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { cn } from "$ui/lib/utils";
	import { BUTTON_SIZE_CTX } from "./buttonContext";

	// Variants kept inline as plain string maps so we don't have to ship
	// `tailwind-variants` (which transitively drags in `tailwind-merge`,
	// ~75 kB raw / ~13 kB gzip).
	type Variant =
		| "default"
		| "secondary"
		| "ghost"
		| "destructive"
		| "outline";
	type Size = "sm" | "md" | "lg";

	const BASE =
		"inline-flex items-center justify-center rounded font-medium transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-border-brand)] disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none";

	const VARIANT_CLASSES: Record<Variant, string> = {
		default:
			"bg-[var(--color-bg-brand)] text-[var(--color-text-onbrand)] hover:opacity-90",
		secondary:
			"bg-[var(--color-bg-secondary)] text-[var(--color-text)] hover:bg-[var(--figma-color-bg-hover)]",
		ghost:
			"hover:bg-[var(--figma-color-bg-hover)] text-[var(--color-text)]",
		destructive:
			"bg-[var(--figma-color-bg-danger)] text-[var(--figma-color-text-ondanger)] hover:opacity-90",
		outline:
			"border border-[var(--color-border)] bg-transparent hover:bg-[var(--figma-color-bg-hover)] text-[var(--color-text)]",
	};

	const SIZE_CLASSES: Record<Size, string> = {
		sm: "h-6 px-2 text-xs gap-1",
		md: "h-7 px-3 text-xs gap-1.5",
		lg: "h-8 px-4 text-sm gap-2",
	};

	type Props = HTMLButtonAttributes & {
		variant?: Variant;
		size?: Size;
		children?: Snippet;
	};
	let {
		variant = "default",
		size,
		class: className,
		children,
		type = "button",
		...rest
	}: Props = $props();

	// An explicit `size` prop always wins. Otherwise inherit a default from the
	// nearest container that sets one (e.g. ViewFooter pins its action buttons
	// to a single size), falling back to "md". Keeps a row of buttons uniform
	// without each call site repeating the size.
	const ctxSize = getContext<Size | undefined>(BUTTON_SIZE_CTX);
	const resolvedSize = $derived<Size>(size ?? ctxSize ?? "md");
</script>

<button
	{...rest}
	{type}
	class={cn(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[resolvedSize], className)}
>
	{@render children?.()}
</button>
