<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Edit, Image, Calendar } from 'lucide-svelte';
	import type { VillageHistory } from '$lib/types/village';
	import { t } from '$lib/i18n';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	interface Props {
		villageHistories?: VillageHistory[];
		isLoading?: boolean;
		onUpdate?: (villageHistoryId: string, updatedData: FormData) => void;
	}

	let { villageHistories = [], isLoading = false, onUpdate = () => {} }: Props = $props();

	let showEditDialog = $state(false);
	let showImageDialog = $state(false);
	let editingVillageHistory: VillageHistory | null = $state(null);
	let selectedImage: string | null = $state(null);
	let editForm = $state({
		description: ''
	});
	let selectedFile: File | null = $state(null);
	let isUpdating = $state(false);
	let message = $state('');

	function openEditDialog(villageHistory: VillageHistory) {
		editingVillageHistory = villageHistory;
		editForm = {
			description: villageHistory.description
		};
		selectedFile = null;
		message = '';
		showEditDialog = true;
	}

	function openImageDialog(imageUrl: string) {
		selectedImage = imageUrl;
		showImageDialog = true;
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('id-ID');
	}

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];
			// Check file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				message = $t('common.village_history.form.image_error_size');
				target.value = '';
				return;
			}
			const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
			if (!allowedTypes.includes(file.type)) {
				message = $t('common.village_history.form.image_error_type');
				target.value = '';
				return;
			}
			selectedFile = file;
			message = '';
		}
	}

	async function handleUpdate() {
		if (!editingVillageHistory) return;

		if (!editForm.description.trim()) {
			message = $t('common.village_history.form.description_required');
			return;
		}

		isUpdating = true;
		try {
			const formData = new FormData();
			formData.append('description', editForm.description);

			if (selectedFile) {
				formData.append('file', selectedFile);
			}

			await onUpdate(editingVillageHistory.id, formData);
			showEditDialog = false;
			editingVillageHistory = null;
			message = '';
		} catch (error) {
			console.error('Error updating village history:', error);
			message = $t('common.village_history.messages.update_error');
		} finally {
			isUpdating = false;
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-semibold">Village Histories</h2>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center py-8 text-muted-foreground">
			<div class="flex items-center gap-2">
				<div
					class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
				></div>
				{$t('common.loading')}
			</div>
		</div>
	{:else if villageHistories.length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
			<div class="text-center">
				<Image class="mx-auto h-12 w-12 text-muted-foreground" />
				<h3 class="text-lg font-medium">{$t('common.village_history.not_found')}</h3>
				<p class="mt-1 text-sm">{$t('common.village_history.not_found_description')}</p>
			</div>
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each villageHistories as history (history.id)}
				<div class="overflow-hidden rounded-lg bg-white shadow-md">
					{#if history.image_url}
						<button
							type="button"
							class="aspect-video w-full rounded-t-lg border-0 bg-gray-200 p-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
							onclick={() => openImageDialog(history.image_url)}
						>
							<img
								src={history.image_url}
								alt="Village history"
								class="h-full w-full rounded-t-lg object-cover transition-transform duration-200 hover:scale-105"
							/>
						</button>
					{:else}
						<div class="flex aspect-video items-center justify-center bg-gray-200">
							<Image class="h-12 w-12 text-gray-400" />
						</div>
					{/if}

					<div class="p-4">
						<p class="mb-3 line-clamp-3 text-sm text-gray-900">{history.description}</p>

						<div class="mb-3 flex items-center justify-between text-xs text-gray-500">
							<div class="flex items-center">
								<Calendar class="mr-1 h-3 w-3" />
								{formatDate(history.created_at)}
							</div>
						</div>

						<div class="flex justify-end">
							<Button size="sm" variant="outline" onclick={() => openEditDialog(history)}>
								<Edit class="mr-1 h-3 w-3" />
								{$t('common.village_history.edit')}
							</Button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Edit Dialog -->
{#if showEditDialog && editingVillageHistory}
	<Dialog.Root bind:open={showEditDialog}>
		<Dialog.Content class="max-w-md">
			<Dialog.Header>
				<Dialog.Title>{$t('common.village_history.form.edit_title')}</Dialog.Title>
				<Dialog.Description>{$t('common.village_history.form.edit_description')}</Dialog.Description
				>
			</Dialog.Header>
			<div class="space-y-4">
				{#if message}
					<div
						class={`rounded p-2 text-sm ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
					>
						{message}
					</div>
				{/if}

				<div>
					<Label for="edit-description">{$t('common.village_history.form.description')} *</Label>
					<Textarea
						id="edit-description"
						bind:value={editForm.description}
						placeholder={$t('common.village_history.form.description_placeholder')}
						required
					/>
				</div>

				<div>
					<Label for="edit-image">{$t('common.village_history.form.image_optional')}</Label>
					<Input id="edit-image" type="file" accept="image/*" onchange={handleFileChange} />
					<p class="mt-1 text-xs text-gray-500">
						{$t('common.village_history.form.image_help')}
					</p>
					{#if selectedFile}
						<p class="mt-1 text-xs text-green-600">
							{$t('common.village_history.form.image_selected')}
							{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
						</p>
					{/if}
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (showEditDialog = false)}>
					{$t('common.village_history.form.cancel')}
				</Button>
				<Button onclick={handleUpdate} disabled={isUpdating}>
					{isUpdating
						? $t('common.village_history.form.updating')
						: $t('common.village_history.form.update')}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}

<!-- Image Dialog -->
{#if showImageDialog && selectedImage}
	<Dialog.Root bind:open={showImageDialog}>
		<Dialog.Content class="max-w-4xl">
			<Dialog.Header>
				<Dialog.Title>{$t('common.village_history.dialog.image_title')}</Dialog.Title>
			</Dialog.Header>
			<div class="mt-4">
				<img
					src={selectedImage}
					alt="Village history"
					class="h-auto max-h-[70vh] w-full rounded-lg object-contain"
				/>
			</div>
			<Dialog.Footer>
				<Button onclick={() => (showImageDialog = false)}
					>{$t('common.village_history.dialog.close')}</Button
				>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}

<style>
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
