<script lang="ts">
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import type { Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 4,
		children,
		...restProps
	}: PopoverPrimitive.ContentProps & {
		children?: Snippet;
	} = $props();
</script>

<PopoverPrimitive.Content
	bind:ref
	{sideOffset}
	class={cn(
		'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</PopoverPrimitive.Content>
