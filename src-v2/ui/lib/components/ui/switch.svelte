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
		"relative h-4 w-7 rounded-full bg-[var(--color-bg-secondary)] data-[state=checked]:bg-[var(--color-bg-brand)] transition-colors disabled:opacity-50",
		className,
	)}
>
	<SwitchPrimitive.Thumb
		class="block h-3 w-3 rounded-full bg-white translate-x-0.5 data-[state=checked]:translate-x-3.5 transition-transform"
	/>
</SwitchPrimitive.Root>
