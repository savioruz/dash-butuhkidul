<script lang="ts">
	import { getFilteredSidebarItems } from '$lib/sidebar.js';
	import NavMain from './nav-main.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { browser } from '$app/environment';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let sidebarItems = $state<any[]>([]);

	// Update sidebar items when component mounts or auth state changes
	$effect(() => {
		if (browser) {
			sidebarItems = getFilteredSidebarItems();
		}
	});
</script>

<Sidebar.Root>
	<Sidebar.Content>
		<NavMain items={sidebarItems} />
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
