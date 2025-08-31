<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Edit, Trash2, Plus, Users, Image } from 'lucide-svelte';
	import type { UnitMember, Unit } from '$lib/types/unit';
	import { t } from '$lib/i18n';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	interface Props {
		unitMembers?: UnitMember[];
		units?: Unit[];
		isLoading?: boolean;
		onDelete?: (unitMemberId: string) => void;
		onAdd?: () => void;
		onUpdate?: (unitMemberId: string, updatedData: FormData) => void;
	}

	let {
		unitMembers = [],
		units = [],
		isLoading = false,
		onDelete = () => {},
		onAdd = () => {},
		onUpdate = () => {}
	}: Props = $props();

	let showEditDialog = $state(false);
	let showPhotoDialog = $state(false);
	let editingUnitMember: UnitMember | null = $state(null);
	let selectedPhoto: string | null = $state(null);
	let selectedPhotoMember: UnitMember | null = $state(null);
	let editForm = $state({
		name: '',
		position: '',
		unit_id: ''
	});
	let selectedFile: File | null = $state(null);
	let isUpdating = $state(false);
	let message = $state('');

	function getUnitName(unitId: string): string {
		const unit = units.find((u) => u.id === unitId);
		return unit?.name || 'Unknown Unit';
	}

	function openEditDialog(unitMember: UnitMember) {
		editingUnitMember = unitMember;
		editForm = {
			name: unitMember.name,
			position: unitMember.position,
			unit_id: unitMember.unit_id
		};
		selectedFile = null;
		message = '';
		showEditDialog = true;
	}

	function openPhotoDialog(member: UnitMember) {
		selectedPhoto = member.photo_url!;
		selectedPhotoMember = member;
		showPhotoDialog = true;
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
				message = $t('common.unit_member.form.photo_error_size');
				target.value = '';
				return;
			}
			// Check file type
			const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
			if (!allowedTypes.includes(file.type)) {
				message = $t('common.unit_member.form.photo_error_type');
				target.value = '';
				return;
			}
			selectedFile = file;
			message = '';
		}
	}

	async function handleUpdate() {
		if (!editingUnitMember) return;

		if (!editForm.name.trim()) {
			message = 'Name is required';
			return;
		}

		if (!editForm.position.trim()) {
			message = 'Position is required';
			return;
		}

		if (!editForm.unit_id) {
			message = 'Unit is required';
			return;
		}

		isUpdating = true;
		try {
			const formData = new FormData();
			formData.append('name', editForm.name);
			formData.append('position', editForm.position);
			formData.append('unit_id', editForm.unit_id);

			if (selectedFile) {
				formData.append('file', selectedFile);
			}

			await onUpdate(editingUnitMember.id, formData);
			showEditDialog = false;
			editingUnitMember = null;
			message = '';
		} catch (error) {
			console.error('Error updating unit member:', error);
			message = $t('common.unit_member.messages.update_error');
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
{:else if unitMembers.length === 0}
	<div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
		<div class="text-center">
			<Users class="mx-auto h-12 w-12 text-muted-foreground" />
			<h3 class="text-lg font-medium">{$t('common.unit_member.not_found')}</h3>
			<p class="mt-1 text-sm">{$t('common.unit_member.not_found_description')}</p>
			<Button onclick={onAdd} class="mt-4">
				<Plus class="mr-2 h-4 w-4" />
				{$t('common.unit_member.add')}
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
							>{$t('common.unit_member.fields.name')}</th
						>
						<th class="min-w-[100px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.unit_member.fields.position')}</th
						>
						<th class="min-w-[100px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.unit_member.fields.unit')}</th
						>
						<th class="min-w-[80px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.unit_member.fields.photo')}</th
						>
						<th class="min-w-[100px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.unit_member.fields.created_at')}</th
						>
						<th class="min-w-[80px] p-2 text-right font-medium whitespace-nowrap sm:p-3"
							>{$t('common.unit_member.fields.actions')}</th
						>
					</tr>
				</thead>
				<tbody>
					{#each unitMembers as member (member.id)}
						<tr class="border-t hover:bg-muted/30">
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
								<div class="font-medium">{member.name}</div>
							</td>
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
								{member.position}
							</td>
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
								{getUnitName(member.unit_id)}
							</td>
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
								{#if member.photo_url}
									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button size="sm" variant="outline" onclick={() => openPhotoDialog(member)}>
													<Image class="mr-1 h-3 w-3" />
													View Photo
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>Click to view {member.name}'s photo</p>
											</Tooltip.Content>
										</Tooltip.Root>
									</Tooltip.Provider>
								{:else}
									<span class="text-muted-foreground">No photo</span>
								{/if}
							</td>
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
								{formatDate(member.created_at)}
							</td>
							<td class="p-2 text-right whitespace-nowrap sm:p-3">
								<div class="flex items-center justify-end gap-1">
									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button size="icon" variant="ghost" onclick={() => openEditDialog(member)}>
													<Edit class="h-4 w-4" />
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>{$t('common.unit_member.edit')}</p>
											</Tooltip.Content>
										</Tooltip.Root>
									</Tooltip.Provider>
									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button
													size="icon"
													variant="destructive"
													onclick={() => onDelete(member.id)}
												>
													<Trash2 class="h-4 w-4" />
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>{$t('common.unit_member.delete')}</p>
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
{#if showEditDialog && editingUnitMember}
	<Dialog.Root bind:open={showEditDialog}>
		<Dialog.Content class="max-w-md">
			<Dialog.Header>
				<Dialog.Title>{$t('common.unit_member.form.edit_title')}</Dialog.Title>
				<Dialog.Description>{$t('common.unit_member.form.edit_description')}</Dialog.Description>
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
					<Label for="edit-name">{$t('common.unit_member.form.name')} *</Label>
					<Input
						id="edit-name"
						bind:value={editForm.name}
						placeholder={$t('common.unit_member.form.name_placeholder')}
						required
					/>
				</div>

				<div>
					<Label for="edit-position">{$t('common.unit_member.form.position')} *</Label>
					<Input
						id="edit-position"
						bind:value={editForm.position}
						placeholder={$t('common.unit_member.form.position_placeholder')}
						required
					/>
				</div>

				<div>
					<Label for="edit-unit">{$t('common.unit_member.form.unit')} *</Label>
					<Select.Root type="single" bind:value={editForm.unit_id}>
						<Select.Trigger class="w-full">
							{#if editForm.unit_id}
								{units.find((u) => u.id === editForm.unit_id)?.name ||
									$t('common.unit_member.form.unit_placeholder')}
							{:else}
								{$t('common.unit_member.form.unit_placeholder')}
							{/if}
						</Select.Trigger>
						<Select.Content>
							{#each units as unit (unit.id)}
								<Select.Item value={unit.id}>
									{unit.name}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div>
					<Label for="edit-photo">{$t('common.unit_member.form.photo_optional')}</Label>
					<Input id="edit-photo" type="file" accept="image/*" onchange={handleFileChange} />
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
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (showEditDialog = false)}
					>{$t('common.unit_member.form.cancel')}</Button
				>
				<Button onclick={handleUpdate} disabled={isUpdating}>
					{isUpdating
						? $t('common.unit_member.form.updating')
						: $t('common.unit_member.form.update')}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}

<!-- Photo Dialog -->
{#if showPhotoDialog && selectedPhoto && selectedPhotoMember}
	<Dialog.Root bind:open={showPhotoDialog}>
		<Dialog.Content class="max-w-md">
			<Dialog.Header>
				<Dialog.Title
					>{selectedPhotoMember.name} - {$t('common.unit_member.fields.photo')}</Dialog.Title
				>
				<Dialog.Description>
					{selectedPhotoMember.position} at {getUnitName(selectedPhotoMember.unit_id)}
				</Dialog.Description>
			</Dialog.Header>
			<div class="mt-4">
				<img
					src={selectedPhoto}
					alt={selectedPhotoMember.name}
					class="h-auto max-h-[60vh] w-full rounded-lg object-contain"
				/>
			</div>
			<Dialog.Footer>
				<Button onclick={() => (showPhotoDialog = false)}>Close</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}
