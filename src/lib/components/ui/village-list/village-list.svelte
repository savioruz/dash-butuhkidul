<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Edit, MapPin } from 'lucide-svelte';
	import type { Village } from '$lib/types/village';
	import { t } from '$lib/i18n';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	interface Props {
		villages?: Village[];
		isLoading?: boolean;
		onUpdate?: (villageId: string, updatedData: Partial<Village>) => void;
	}

	let { villages = [], isLoading = false, onUpdate = () => {} }: Props = $props();

	let showEditDialog = $state(false);
	let editingVillage: Village | null = $state(null);
	let editForm = $state({
		name: '',
		address: '',
		latitude: 0,
		longitude: 0
	});
	let isUpdating = $state(false);

	function openEditDialog(village: Village) {
		editingVillage = village;
		editForm = {
			name: village.name,
			address: village.address,
			latitude: village.latitude,
			longitude: village.longitude
		};
		showEditDialog = true;
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('id-ID');
	}

	async function handleUpdate() {
		if (!editingVillage) return;

		isUpdating = true;
		try {
			await onUpdate(editingVillage.id, editForm);
			showEditDialog = false;
			editingVillage = null;
		} catch (error) {
			console.error('Error updating village:', error);
		} finally {
			isUpdating = false;
		}
	}
</script>

{#if isLoading}
	<div class="flex items-center justify-center py-8 text-muted-foreground">
		<div class="flex items-center gap-2">
			<div
				class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
			></div>
			{$t('common.loading')}
		</div>
	</div>
{:else if villages.length === 0}
	<div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
		<div class="text-center">
			<MapPin class="mx-auto h-12 w-12 text-muted-foreground" />
			<h3 class="text-lg font-medium">{$t('common.village.not_found')}</h3>
			<p class="mt-1 text-sm">{$t('common.village.not_found_description')}</p>
		</div>
	</div>
{:else}
	<div class="w-full overflow-hidden rounded-md border">
		<div class="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="bg-muted/50">
					<tr class="text-left">
						<th class="min-w-[120px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.village.fields.name')}</th
						>
						<th class="min-w-[150px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.village.fields.address')}</th
						>
						<th class="min-w-[120px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.village.fields.coordinates')}</th
						>
						<th class="min-w-[100px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.village.fields.created_at')}</th
						>
						<th class="min-w-[80px] p-2 text-right font-medium whitespace-nowrap sm:p-3"
							>{$t('common.village.fields.actions')}</th
						>
					</tr>
				</thead>
				<tbody>
					{#each villages as village (village.id)}
						<tr class="border-t hover:bg-muted/30">
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
								<div class="font-medium">{village.name}</div>
							</td>
							<td
								class="max-w-[150px] truncate p-2 text-xs sm:max-w-[200px] sm:p-3 sm:text-sm"
								title={village.address}
							>
								{village.address}
							</td>
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
								<div class="font-mono text-xs">
									{village.latitude.toFixed(6)}, {village.longitude.toFixed(6)}
								</div>
							</td>
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
								{formatDate(village.created_at)}
							</td>
							<td class="p-2 text-right whitespace-nowrap sm:p-3">
								<div class="flex items-center justify-end gap-1">
									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button size="icon" variant="ghost" onclick={() => openEditDialog(village)}>
													<Edit class="h-4 w-4" />
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>{$t('common.village.edit')}</p>
											</Tooltip.Content>
										</Tooltip.Root>
									</Tooltip.Provider>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="block border-t bg-muted/20 p-2 text-center text-xs text-muted-foreground sm:hidden">
			← Scroll to see more →
		</div>
	</div>
{/if}

<!-- Edit Dialog -->
{#if showEditDialog && editingVillage}
	<Dialog.Root bind:open={showEditDialog}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>{$t('common.village.form.edit_title')}</Dialog.Title>
				<Dialog.Description>{$t('common.village.form.edit_description')}</Dialog.Description>
			</Dialog.Header>
			<div class="space-y-4">
				<div>
					<Label for="edit-name">{$t('common.village.form.name')}</Label>
					<Input
						id="edit-name"
						bind:value={editForm.name}
						placeholder={$t('common.village.form.name_placeholder')}
						required
					/>
				</div>
				<div>
					<Label for="edit-address">{$t('common.village.form.address')}</Label>
					<Textarea
						id="edit-address"
						bind:value={editForm.address}
						placeholder={$t('common.village.form.address_placeholder')}
						required
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<Label for="edit-latitude">{$t('common.village.form.latitude')}</Label>
						<Input
							id="edit-latitude"
							type="number"
							step="any"
							bind:value={editForm.latitude}
							placeholder={$t('common.village.form.latitude_placeholder')}
							required
						/>
					</div>
					<div>
						<Label for="edit-longitude">{$t('common.village.form.longitude')}</Label>
						<Input
							id="edit-longitude"
							type="number"
							step="any"
							bind:value={editForm.longitude}
							placeholder={$t('common.village.form.longitude_placeholder')}
							required
						/>
					</div>
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (showEditDialog = false)}
					>{$t('common.village.form.cancel')}</Button
				>
				<Button onclick={handleUpdate} disabled={isUpdating}>
					{isUpdating ? $t('common.village.form.updating') : $t('common.village.form.update')}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}
