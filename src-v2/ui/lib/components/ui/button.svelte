<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { tv, type VariantProps } from "tailwind-variants";
	import { cn } from "$ui/lib/utils";

	const button = tv({
		base: "inline-flex items-center justify-center rounded font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-border-brand)] disabled:opacity-50 disabled:pointer-events-none",
		variants: {
			variant: {
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
			},
			size: {
				sm: "h-6 px-2 text-xs gap-1",
				md: "h-7 px-3 text-xs gap-1.5",
				lg: "h-8 px-4 text-sm gap-2",
			},
		},
		defaultVariants: { variant: "default", size: "md" },
	});

	type Props = HTMLButtonAttributes &
		VariantProps<typeof button> & { children?: Snippet };
	let {
		variant,
		size,
		class: className,
		children,
		type = "button",
		...rest
	}: Props = $props();
</script>

<button {...rest} {type} class={cn(button({ variant, size }), className)}>
	{@render children?.()}
</button>
