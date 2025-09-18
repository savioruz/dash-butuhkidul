<script lang="ts">
	import { onMount } from 'svelte';
	import { villageApi } from '$lib/api/village';
	import { VillageList } from '$lib/components/ui/village-list';
	import type { Village, GetVillagesResponse, UpdateVillageRequest } from '$lib/types/village';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { RefreshCw } from 'lucide-svelte';
	import { t } from '$lib/i18n';
	import { toast } from 'svelte-sonner';

	let villages: Village[] = $state([]);
	let isLoading = $state(true);

	onMount(async () => {
		await loadVillages();
	});

	async function loadVillages() {
		try {
			isLoading = true;
			const response = (await villageApi.getVillages()) as GetVillagesResponse;
			if (response.data) {
				villages = response.data.villages;
			}
		} catch (err) {
			console.error('Error loading villages:', err);
			toast.error(err instanceof Error ? err.message : 'Failed to load villages');
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdate(villageId: string, updatedData: UpdateVillageRequest) {
		try {
			await villageApi.updateVillage(villageId, updatedData);
			toast.success('Village updated successfully');
			await loadVillages();
		} catch (err) {
			console.error('Error updating village:', err);
			toast.error(err instanceof Error ? err.message : 'Failed to update village');
			throw err;
		}
	}

	async function handleRefresh() {
		await loadVillages();
	}
</script>

<svelte:head>
	<title>{$t('navigation.sidebar.village.profiles')}</title>
</svelte:head>

<div class="container mx-auto space-y-6 p-4">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">{$t('common.village.title')}</h1>
			<p class="text-muted-foreground">{$t('common.village.subtitle')}</p>
		</div>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button variant="outline" size="icon" onclick={handleRefresh} disabled={isLoading}>
					<RefreshCw class="h-4 w-4" />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>{$t('common.village.refresh')}</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</div>

	<VillageList {villages} {isLoading} onUpdate={handleUpdate} />
</div>
