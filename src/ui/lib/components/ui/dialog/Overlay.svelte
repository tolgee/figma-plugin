<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { cn } from "$ui/lib/utils";

	type Props = DialogPrimitive.OverlayProps;
	let { class: className, ...rest }: Props = $props();
</script>

<DialogPrimitive.Overlay
	{...rest}
	class={cn(
		"fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out",
		className,
	)}
/>
