<script lang="ts">
	import { onMount } from 'svelte';
	import { villageHistoryApi } from '$lib/api/village';
	import { VillageHistoryList } from '$lib/components/ui/village-history-list';
	import type { VillageHistory, GetVillageHistoriesResponse } from '$lib/types/village';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { RefreshCw } from 'lucide-svelte';
	import { t } from '$lib/i18n';

	let villageHistories: VillageHistory[] = $state([]);
	let isLoading = $state(true);
	let errorMessage = $state('');
	let successMessage = $state('');

	onMount(async () => {
		await loadVillageHistories();
	});

	async function loadVillageHistories() {
		try {
			isLoading = true;
			errorMessage = '';
			const response =
				(await villageHistoryApi.getVillageHistories()) as GetVillageHistoriesResponse;
			if (response.data) {
				villageHistories = response.data.village_histories;
			}
		} catch (err) {
			console.error('Error loading village histories:', err);
			errorMessage = err instanceof Error ? err.message : 'Failed to load village histories';
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdate(villageHistoryId: string, formData: FormData) {
		try {
			errorMessage = '';
			successMessage = '';
			await villageHistoryApi.updateVillageHistory(villageHistoryId, {
				description: formData.get('description') as string,
				file: (formData.get('file') as File | null) || undefined
			});
			successMessage = 'Village history updated successfully';
			await loadVillageHistories();
		} catch (err) {
			console.error('Error updating village history:', err);
			errorMessage = err instanceof Error ? err.message : 'Failed to update village history';
			throw err;
		}
	}

	async function handleRefresh() {
		await loadVillageHistories();
	}

	function dismissMessage() {
		errorMessage = '';
		successMessage = '';
	}
</script>

<svelte:head>
	<title>{$t('navigation.sidebar.village.histories')}</title>
</svelte:head>

<div class="space-y-6 py-2">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">{$t('common.village_history.title')}</h1>
			<p class="text-muted-foreground">{$t('common.village_history.subtitle')}</p>
		</div>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button variant="outline" size="icon" onclick={handleRefresh} disabled={isLoading}>
					<RefreshCw class="h-4 w-4" />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>{$t('common.village_history.refresh')}</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</div>
	<!-- Success Message -->
	{#if successMessage}
		<Card.Root class="border-green-200 bg-green-50">
			<Card.Content>
				<div class="flex items-center justify-between">
					<p class="text-green-600">{successMessage}</p>
					<Button
						variant="ghost"
						onclick={dismissMessage}
						size="sm"
						class="text-green-600 hover:text-green-700"
					>
						×
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Error Message -->
	{#if errorMessage}
		<Card.Root class="border-red-200 bg-red-50">
			<Card.Content>
				<div class="flex items-center justify-between">
					<p class="text-red-600">{errorMessage}</p>
					<Button
						variant="ghost"
						onclick={dismissMessage}
						size="sm"
						class="text-red-600 hover:text-red-700"
					>
						×
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<VillageHistoryList {villageHistories} {isLoading} onUpdate={handleUpdate} />
</div>
