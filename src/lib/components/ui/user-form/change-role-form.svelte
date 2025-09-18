<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { t } from '$lib/i18n';
	import type { UpdateRoleRequest, User } from '$lib/types/user';

	interface Props {
		isOpen: boolean;
		user?: User | null;
		isSubmitting?: boolean;
		onClose: () => void;
		onSubmit: (data: UpdateRoleRequest) => void;
	}

	let {
		isOpen = $bindable(),
		user = null,
		isSubmitting = false,
		onClose,
		onSubmit
	}: Props = $props();

	let formData = $state({
		level: '1' as '0' | '1' | '2'
	});

	let errors = $state({
		level: ''
	});

	// Reset form when dialog opens/closes or user changes
	$effect(() => {
		if (isOpen && user) {
			formData = {
				level: user.level as '0' | '1' | '2'
			};
		}
		if (isOpen) {
			errors = {
				level: ''
			};
		}
	});

	function validateForm() {
		let isValid = true;
		errors = {
			level: ''
		};

		if (!formData.level) {
			errors.level = $t('common.user.form.level_required');
			isValid = false;
		}

		return isValid;
	}

	function handleSubmit() {
		if (!validateForm()) return;

		onSubmit({
			level: formData.level
		});
	}

	const levelOptions = [
		{ value: '0', label: $t('common.user.levels.0') },
		{ value: '1', label: $t('common.user.levels.1') },
		{ value: '2', label: $t('common.user.levels.2') }
	];

	// eslint-disable-next-line svelte/prefer-writable-derived
	let selectedLevelString = $state('1');

	// Initialize selectedLevelString from formData
	$effect(() => {
		selectedLevelString = formData.level;
	});

	// Update formData.level when selectedLevelString changes
	$effect(() => {
		if (selectedLevelString) {
			formData.level = selectedLevelString as '0' | '1' | '2';
		}
	});
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Content class="sm:max-w-[400px]">
		<Dialog.Header>
			<Dialog.Title>Change User Role</Dialog.Title>
			<Dialog.Description>
				Change the role/level for user
				{#if user}
					{user.full_name}
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<!-- Current Role -->
			{#if user}
				<div class="space-y-2">
					<Label>Current Role</Label>
					<div class="text-sm text-muted-foreground">
						{$t(`common.user.levels.${user.level}`)}
					</div>
				</div>
			{/if}

			<!-- New Role -->
			<div class="space-y-2">
				<Label for="level">New Role</Label>
				<Select.Root type="single" bind:value={selectedLevelString}>
					<Select.Trigger class={errors.level ? 'border-red-500' : ''}>
						{levelOptions.find((opt) => opt.value === selectedLevelString)?.label ||
							'Select new role'}
					</Select.Trigger>
					<Select.Content>
						{#each levelOptions as option (option.value)}
							<Select.Item value={option.value}>{option.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if errors.level}
					<p class="text-sm text-red-500">{errors.level}</p>
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={onClose}>
				{$t('common.user.form.cancel')}
			</Button>
			<Button type="button" disabled={isSubmitting} onclick={handleSubmit}>
				{#if isSubmitting}
					{$t('common.user.form.updating')}
				{:else}
					Update Role
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
