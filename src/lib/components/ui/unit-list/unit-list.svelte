<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Edit, Trash2, Plus, Building } from 'lucide-svelte';
	import type { Unit } from '$lib/types/unit';
	import { t } from '$lib/i18n';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	interface Props {
		units?: Unit[];
		isLoading?: boolean;
		onDelete?: (unitId: string) => void;
		onAdd?: () => void;
		onUpdate?: (unitId: string, updatedData: Partial<Unit>) => void;
	}

	let {
		units = [],
		isLoading = false,
		onDelete = () => {},
		onAdd = () => {},
		onUpdate = () => {}
	}: Props = $props();

	let showEditDialog = $state(false);
	let editingUnit: Unit | null = $state(null);
	let editForm = $state({
		name: '',
		description: ''
	});
	let isUpdating = $state(false);

	function openEditDialog(unit: Unit) {
		editingUnit = unit;
		editForm = {
			name: unit.name,
			description: unit.description || ''
		};
		showEditDialog = true;
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('id-ID');
	}

	async function handleUpdate() {
		if (!editingUnit) return;

		isUpdating = true;
		try {
			await onUpdate(editingUnit.id, editForm);
			showEditDialog = false;
			editingUnit = null;
		} catch (error) {
			console.error('Error updating unit:', error);
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
{:else if units.length === 0}
	<div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
		<div class="text-center">
			<Building class="mx-auto h-12 w-12 text-muted-foreground" />
			<h3 class="text-lg font-medium">{$t('common.unit.not_found')}</h3>
			<p class="mt-1 text-sm">{$t('common.unit.not_found_description')}</p>
			<Button onclick={onAdd} class="mt-4">
				<Plus class="mr-2 h-4 w-4" />
				{$t('common.unit.add')}
			</Button>
		</div>
	</div>
{:else}
	<div class="w-full overflow-hidden rounded-md border">
		<div class="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="bg-muted/50">
					<tr class="text-left">
						<th class="min-w-[120px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.unit.fields.name')}</th
						>
						<th class="min-w-[150px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.unit.fields.description')}</th
						>
						<th class="min-w-[100px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.unit.fields.created_at')}</th
						>
						<th class="min-w-[80px] p-2 text-right font-medium whitespace-nowrap sm:p-3"
							>{$t('common.unit.fields.actions')}</th
						>
					</tr>
				</thead>
				<tbody>
					{#each units as unit (unit.id)}
						<tr class="border-t hover:bg-muted/30">
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
								<div class="font-medium">{unit.name}</div>
							</td>
							<td
								class="max-w-[150px] truncate p-2 text-xs sm:max-w-[200px] sm:p-3 sm:text-sm"
								title={unit.description || '-'}
							>
								{unit.description || '-'}
							</td>
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
								{formatDate(unit.created_at)}
							</td>
							<td class="p-2 text-right whitespace-nowrap sm:p-3">
								<div class="flex items-center justify-end gap-1">
									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button size="icon" variant="ghost" onclick={() => openEditDialog(unit)}>
													<Edit class="h-4 w-4" />
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>{$t('common.unit.edit')}</p>
											</Tooltip.Content>
										</Tooltip.Root>
									</Tooltip.Provider>
									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button size="icon" variant="destructive" onclick={() => onDelete(unit.id)}>
													<Trash2 class="h-4 w-4" />
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>{$t('common.unit.delete')}</p>
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
{#if showEditDialog && editingUnit}
	<Dialog.Root bind:open={showEditDialog}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>{$t('common.unit.form.edit_title')}</Dialog.Title>
				<Dialog.Description>{$t('common.unit.form.edit_description')}</Dialog.Description>
			</Dialog.Header>
			<div class="space-y-4">
				<div>
					<Label for="edit-name">{$t('common.unit.form.name')}</Label>
					<Input
						id="edit-name"
						bind:value={editForm.name}
						placeholder={$t('common.unit.form.name_placeholder')}
						required
					/>
				</div>
				<div>
					<Label for="edit-description"
						>{$t('common.unit.form.description')}
						{$t('common.unit.form.description_optional')}</Label
					>
					<Textarea
						id="edit-description"
						bind:value={editForm.description}
						placeholder={$t('common.unit.form.description_placeholder')}
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (showEditDialog = false)}
					>{$t('common.unit.form.cancel')}</Button
				>
				<Button onclick={handleUpdate} disabled={isUpdating}>
					{isUpdating ? $t('common.unit.form.updating') : $t('common.unit.form.update')}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}
