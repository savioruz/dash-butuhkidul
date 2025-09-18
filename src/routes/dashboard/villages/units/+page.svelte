<script lang="ts">
	import { onMount } from 'svelte';
	import { unitApi } from '$lib/api/units';
	import { UnitList } from '$lib/components/ui/unit-list';
	import type {
		Unit,
		GetUnitsResponse,
		CreateUnitRequest,
		UpdateUnitRequest
	} from '$lib/types/unit';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { RefreshCw, Plus } from 'lucide-svelte';
	import { t } from '$lib/i18n';
	import { toast } from 'svelte-sonner';

	let units: Unit[] = $state([]);
	let isLoading = $state(true);
	let showAddDialog = $state(false);
	let isCreating = $state(false);
	let addForm = $state({
		name: '',
		description: ''
	});

	onMount(async () => {
		await loadUnits();
	});

	async function loadUnits() {
		try {
			isLoading = true;
			const response = (await unitApi.getUnits()) as GetUnitsResponse;
			if (response.data) {
				units = response.data.units;
			}
		} catch (err) {
			console.error('Error loading units:', err);
			toast.error(err instanceof Error ? err.message : 'Failed to load units');
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdate(unitId: string, updatedData: UpdateUnitRequest) {
		try {
			await unitApi.updateUnit(unitId, updatedData);
			toast.success($t('common.unit.messages.updated'));
			await loadUnits();
		} catch (err) {
			console.error('Error updating unit:', err);
			toast.error(err instanceof Error ? err.message : 'Failed to update unit');
			throw err;
		}
	}

	async function handleDelete(unitId: string) {
		if (!confirm('Are you sure you want to delete this unit?')) {
			return;
		}

		try {
			await unitApi.deleteUnit(unitId);
			toast.success($t('common.unit.messages.deleted'));
			await loadUnits();
		} catch (err) {
			console.error('Error deleting unit:', err);
			toast.error(err instanceof Error ? err.message : 'Failed to delete unit');
		}
	}

	async function handleAdd() {
		if (!addForm.name.trim()) {
			return;
		}

		isCreating = true;
		try {
			const createData: CreateUnitRequest = {
				name: addForm.name,
				description: addForm.description || undefined
			};

			await unitApi.createUnit(createData);
			toast.success($t('common.unit.messages.created'));
			showAddDialog = false;
			addForm = { name: '', description: '' };
			await loadUnits();
		} catch (err) {
			console.error('Error creating unit:', err);
			toast.error(err instanceof Error ? err.message : 'Failed to create unit');
		} finally {
			isCreating = false;
		}
	}

	async function handleRefresh() {
		await loadUnits();
	}

	function openAddDialog() {
		addForm = { name: '', description: '' };
		showAddDialog = true;
	}
</script>

<svelte:head>
	<title>{$t('navigation.sidebar.village.units')}</title>
</svelte:head>

<div class="container mx-auto space-y-6 p-4">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">{$t('common.unit.title')}</h1>
			<p class="text-muted-foreground">{$t('common.unit.subtitle')}</p>
		</div>
		<div class="flex gap-2">
			<Tooltip.Root>
				<Tooltip.Trigger>
					<Button variant="outline" size="icon" onclick={handleRefresh} disabled={isLoading}>
						<RefreshCw class="h-4 w-4" />
					</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>{$t('common.unit.refresh')}</p>
				</Tooltip.Content>
			</Tooltip.Root>
			<Button onclick={openAddDialog}>
				<Plus class="mr-2 h-4 w-4" />
				{$t('common.unit.add')}
			</Button>
		</div>
	</div>

	<UnitList
		{units}
		{isLoading}
		onUpdate={handleUpdate}
		onDelete={handleDelete}
		onAdd={openAddDialog}
	/>
</div>

<!-- Add Unit Dialog -->
<Dialog.Root bind:open={showAddDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{$t('common.unit.form.add_title')}</Dialog.Title>
			<Dialog.Description>{$t('common.unit.form.add_description')}</Dialog.Description>
		</Dialog.Header>
		<form onsubmit={handleAdd} class="space-y-4">
			<div>
				<Label for="add-name">{$t('common.unit.form.name')} *</Label>
				<Input
					id="add-name"
					bind:value={addForm.name}
					placeholder={$t('common.unit.form.name_placeholder')}
					required
				/>
			</div>
			<div>
				<Label for="add-description"
					>{$t('common.unit.form.description')} {$t('common.unit.form.description_optional')}</Label
				>
				<Textarea
					id="add-description"
					bind:value={addForm.description}
					placeholder={$t('common.unit.form.description_placeholder')}
				/>
			</div>
		</form>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showAddDialog = false)}
				>{$t('common.unit.form.cancel')}</Button
			>
			<Button onclick={handleAdd} disabled={isCreating}>
				{isCreating ? $t('common.unit.form.creating') : $t('common.unit.form.create')}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
