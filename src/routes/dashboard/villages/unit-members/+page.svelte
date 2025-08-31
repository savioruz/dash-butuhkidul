<script lang="ts">
	import { onMount } from 'svelte';
	import { unitApi, unitMemberApi } from '$lib/api/units';
	import { UnitMemberList } from '$lib/components/ui/unit-member-list';
	import type { Unit, UnitMember, GetUnitsResponse, GetUnitMembersResponse } from '$lib/types/unit';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { RefreshCw, Plus } from 'lucide-svelte';
	import { t } from '$lib/i18n';

	let unitMembers: UnitMember[] = $state([]);
	let units: Unit[] = $state([]);
	let isLoading = $state(true);
	let errorMessage = $state('');
	let successMessage = $state('');
	let showAddDialog = $state(false);
	let isCreating = $state(false);
	let addForm = $state({
		name: '',
		position: '',
		unit_id: ''
	});
	let selectedFile: File | null = $state(null);
	let addMessage = $state('');

	onMount(async () => {
		await Promise.all([loadUnitMembers(), loadUnits()]);
	});

	async function loadUnitMembers() {
		try {
			isLoading = true;
			errorMessage = '';
			const response = (await unitMemberApi.getUnitMembers()) as GetUnitMembersResponse;
			if (response.data) {
				unitMembers = response.data.unit_members;
			}
		} catch (err) {
			console.error('Error loading unit members:', err);
			errorMessage = err instanceof Error ? err.message : 'Failed to load unit members';
		} finally {
			isLoading = false;
		}
	}

	async function loadUnits() {
		try {
			const response = (await unitApi.getUnits()) as GetUnitsResponse;
			if (response.data) {
				units = response.data.units;
			}
		} catch (err) {
			console.error('Error loading units:', err);
		}
	}

	async function handleUpdate(unitMemberId: string, updatedData: FormData) {
		try {
			errorMessage = '';
			successMessage = '';
			await unitMemberApi.updateUnitMember(unitMemberId, updatedData);
			successMessage = $t('common.unit_member.messages.updated');
			await loadUnitMembers();
		} catch (err) {
			console.error('Error updating unit member:', err);
			errorMessage = err instanceof Error ? err.message : 'Failed to update unit member';
			throw err;
		}
	}

	async function handleDelete(unitMemberId: string) {
		if (!confirm('Are you sure you want to delete this unit member?')) {
			return;
		}

		try {
			errorMessage = '';
			successMessage = '';
			await unitMemberApi.deleteUnitMember(unitMemberId);
			successMessage = $t('common.unit_member.messages.deleted');
			await loadUnitMembers();
		} catch (err) {
			console.error('Error deleting unit member:', err);
			errorMessage = err instanceof Error ? err.message : 'Failed to delete unit member';
		}
	}

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];
			// Check file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				addMessage = $t('common.unit_member.form.photo_error_size');
				target.value = '';
				return;
			}
			// Check file type
			const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
			if (!allowedTypes.includes(file.type)) {
				addMessage = $t('common.unit_member.form.photo_error_type');
				target.value = '';
				return;
			}
			selectedFile = file;
			addMessage = '';
		}
	}

	async function handleAdd() {
		if (!addForm.name.trim() || !addForm.position.trim() || !addForm.unit_id) {
			addMessage = 'All required fields must be filled';
			return;
		}

		isCreating = true;
		try {
			const formData = new FormData();
			formData.append('name', addForm.name);
			formData.append('position', addForm.position);
			formData.append('unit_id', addForm.unit_id);

			if (selectedFile) {
				formData.append('file', selectedFile);
			}

			await unitMemberApi.createUnitMember(formData);
			successMessage = $t('common.unit_member.messages.created');
			showAddDialog = false;
			addForm = { name: '', position: '', unit_id: '' };
			selectedFile = null;
			addMessage = '';
			await loadUnitMembers();
		} catch (err) {
			console.error('Error creating unit member:', err);
			addMessage = err instanceof Error ? err.message : 'Failed to create unit member';
		} finally {
			isCreating = false;
		}
	}

	async function handleRefresh() {
		await Promise.all([loadUnitMembers(), loadUnits()]);
	}

	function dismissMessage() {
		errorMessage = '';
		successMessage = '';
	}

	function openAddDialog() {
		addForm = { name: '', position: '', unit_id: '' };
		selectedFile = null;
		addMessage = '';
		showAddDialog = true;
	}
</script>

<svelte:head>
	<title>{$t('navigation.sidebar.village.unit_members')}</title>
</svelte:head>

<div class="container mx-auto space-y-6 p-4">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">{$t('common.unit_member.title')}</h1>
			<p class="text-muted-foreground">{$t('common.unit_member.subtitle')}</p>
		</div>
		<div class="flex gap-2">
			<Tooltip.Root>
				<Tooltip.Trigger>
					<Button variant="outline" size="icon" onclick={handleRefresh} disabled={isLoading}>
						<RefreshCw class="h-4 w-4" />
					</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>{$t('common.unit_member.refresh')}</p>
				</Tooltip.Content>
			</Tooltip.Root>
			<Button onclick={openAddDialog}>
				<Plus class="mr-2 h-4 w-4" />
				{$t('common.unit_member.add')}
			</Button>
		</div>
	</div>

	{#if errorMessage}
		<Card.Root class="border-destructive bg-destructive/5">
			<Card.Content class="flex items-center justify-between">
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
			<Card.Content class="flex items-center justify-between">
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

	{#if units.length === 0 && !isLoading}
		<Card.Root class="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
			<Card.Content class="pt-6">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/50">
						<svg
							class="h-4 w-4 text-yellow-600 dark:text-yellow-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
					</div>
					<div>
						<h3 class="font-medium text-yellow-800 dark:text-yellow-200">No Units Available</h3>
						<p class="text-sm text-yellow-600 dark:text-yellow-400">
							You need to create organizational units first before you can add unit members.
						</p>
						<div class="mt-2">
							<Button
								variant="outline"
								size="sm"
								onclick={() => (window.location.href = '/dashboard/village/units')}
							>
								Go to Units Page
							</Button>
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<UnitMemberList
		{unitMembers}
		{units}
		{isLoading}
		onUpdate={handleUpdate}
		onDelete={handleDelete}
		onAdd={openAddDialog}
	/>
</div>

<!-- Add Unit Member Dialog -->
<Dialog.Root bind:open={showAddDialog}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>{$t('common.unit_member.form.add_title')}</Dialog.Title>
			<Dialog.Description>{$t('common.unit_member.form.add_description')}</Dialog.Description>
		</Dialog.Header>
		<form onsubmit={handleAdd} class="space-y-4">
			{#if addMessage}
				<div
					class={`rounded p-2 text-sm ${addMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
				>
					{addMessage}
				</div>
			{/if}

			<div>
				<Label for="add-name">{$t('common.unit_member.form.name')} *</Label>
				<Input
					id="add-name"
					bind:value={addForm.name}
					placeholder={$t('common.unit_member.form.name_placeholder')}
					required
				/>
			</div>

			<div>
				<Label for="add-position">{$t('common.unit_member.form.position')} *</Label>
				<Input
					id="add-position"
					bind:value={addForm.position}
					placeholder={$t('common.unit_member.form.position_placeholder')}
					required
				/>
			</div>

			<div>
				<Label for="add-unit">{$t('common.unit_member.form.unit')} *</Label>
				<p class="mb-2 text-xs text-gray-500">
					Available units: {units.length}
					{#if units.length === 0}
						(No units found - please create units first)
					{/if}
				</p>
				<Select.Root type="single" bind:value={addForm.unit_id}>
					<Select.Trigger class="w-full">
						{#if addForm.unit_id}
							{units.find((u) => u.id === addForm.unit_id)?.name ||
								$t('common.unit_member.form.unit_placeholder')}
						{:else}
							{units.length === 0
								? 'No units available'
								: $t('common.unit_member.form.unit_placeholder')}
						{/if}
					</Select.Trigger>
					<Select.Content>
						{#if units.length === 0}
							<Select.Item value="" disabled>No units available - Create units first</Select.Item>
						{:else}
							{#each units as unit (unit.id)}
								<Select.Item value={unit.id}>
									{unit.name}
								</Select.Item>
							{/each}
						{/if}
					</Select.Content>
				</Select.Root>
			</div>

			<div>
				<Label for="add-photo">{$t('common.unit_member.form.photo_optional')}</Label>
				<Input id="add-photo" type="file" accept="image/*" onchange={handleFileChange} />
				<p class="mt-1 text-xs text-gray-500">
					{$t('common.unit_member.form.photo_help')}
				</p>
				{#if selectedFile}
					<p class="mt-1 text-xs text-green-600">
						{$t('common.unit_member.form.photo_selected')}
						{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
					</p>
				{/if}
			</div>
		</form>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showAddDialog = false)}
				>{$t('common.unit_member.form.cancel')}</Button
			>
			<Button onclick={handleAdd} disabled={isCreating}>
				{isCreating ? $t('common.unit_member.form.creating') : $t('common.unit_member.form.create')}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
