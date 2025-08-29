<script lang="ts">
	import { onMount } from 'svelte';
	import { villageApi } from '$lib/api/village';
	import { VillageList } from '$lib/components/ui/village-list';
	import type { Village, GetVillagesResponse, UpdateVillageRequest } from '$lib/types/village';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { RefreshCw } from 'lucide-svelte';
	import { t } from '$lib/i18n';

	let villages: Village[] = $state([]);
	let isLoading = $state(true);
	let errorMessage = $state('');
	let successMessage = $state('');

	onMount(async () => {
		await loadVillages();
	});

	async function loadVillages() {
		try {
			isLoading = true;
			errorMessage = '';
			const response = (await villageApi.getVillages()) as GetVillagesResponse;
			if (response.data) {
				villages = response.data.villages;
			}
		} catch (err) {
			console.error('Error loading villages:', err);
			errorMessage = err instanceof Error ? err.message : 'Failed to load villages';
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdate(villageId: string, updatedData: UpdateVillageRequest) {
		try {
			errorMessage = '';
			successMessage = '';
			await villageApi.updateVillage(villageId, updatedData);
			successMessage = 'Village updated successfully';
			// Reload villages after successful update
			await loadVillages();
		} catch (err) {
			console.error('Error updating village:', err);
			errorMessage = err instanceof Error ? err.message : 'Failed to update village';
			throw err;
		}
	}

	async function handleRefresh() {
		await loadVillages();
	}

	function dismissMessage() {
		errorMessage = '';
		successMessage = '';
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
	{#if errorMessage}
		<Card.Root class="border-destructive bg-destructive/5">
			<Card.Content class="flex items-center justify-between pt-6">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-destructive/20 p-2">
						<svg
							class="h-4 w-4 text-destructive"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</div>
					<div>
						<h3 class="font-medium text-destructive">Error</h3>
						<p class="text-sm text-muted-foreground">{errorMessage}</p>
					</div>
				</div>
				<Button variant="ghost" size="sm" onclick={dismissMessage}>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</Button>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if successMessage}
		<Card.Root class="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
			<Card.Content class="flex items-center justify-between pt-6">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-green-100 p-2 dark:bg-green-900/50">
						<svg
							class="h-4 w-4 text-green-600 dark:text-green-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<div>
						<h3 class="font-medium text-green-800 dark:text-green-200">Success</h3>
						<p class="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
					</div>
				</div>
				<Button variant="ghost" size="sm" onclick={dismissMessage}>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</Button>
			</Card.Content>
		</Card.Root>
	{/if}

	<VillageList {villages} {isLoading} onUpdate={handleUpdate} />
</div>
