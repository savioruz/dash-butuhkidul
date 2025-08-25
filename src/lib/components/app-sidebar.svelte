<script lang="ts" module>
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
	import { navigationConfig } from '$lib/navigation';
	import { sidebarItems } from '@/sidebar';

	const data = sidebarItems;
</script>

<script lang="ts">
	import NavMain from './nav-main.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import SidebarFooter from './ui/sidebar/sidebar-footer.svelte';

	let {
		ref = $bindable(null),
		collapsible = 'icon',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root {collapsible} {...restProps}>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
	</Sidebar.Content>
	<SidebarFooter>
		{#each navigationConfig as item (item.href)}
			{@const isActive = page.url.pathname === item.href}
			<a
				href={item.href}
				class="smooth-transition w-fit text-xs font-medium md:text-sm {isActive
					? 'text-gradient'
					: 'animated-underline'}"
				data-sveltekit-preload-data
			>
				{$t(`navigation.${item.translationKey}`) || item.label}
			</a>
		{/each}
	</SidebarFooter>
	<Sidebar.Rail />
</Sidebar.Root>
