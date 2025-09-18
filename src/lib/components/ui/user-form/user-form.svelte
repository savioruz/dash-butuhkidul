<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { t } from '$lib/i18n';
	import type { CreateUserRequest, UpdateProfileRequest, User } from '$lib/types/user';

	interface Props {
		isOpen: boolean;
		mode: 'create' | 'edit';
		user?: User | null;
		isSubmitting?: boolean;
		onClose: () => void;
		onSubmit: (data: CreateUserRequest | UpdateProfileRequest) => void;
	}

	let {
		isOpen = $bindable(),
		mode,
		user = null,
		isSubmitting = false,
		onClose,
		onSubmit
	}: Props = $props();

	let formData = $state({
		email: '',
		full_name: '',
		password: '',
		level: '1' as '0' | '1',
		is_verified: false
	});

	let errors = $state({
		email: '',
		full_name: '',
		password: '',
		level: ''
	});

	// Reset form when dialog opens/closes or user changes
	$effect(() => {
		if (isOpen && mode === 'edit' && user) {
			formData = {
				email: user.email,
				full_name: user.full_name,
				password: '',
				level: user.level.toString() as '0' | '1',
				is_verified: user.is_verified
			};
		} else if (isOpen && mode === 'create') {
			formData = {
				email: '',
				full_name: '',
				password: '',
				level: '1',
				is_verified: false
			};
		}
		// Clear errors when dialog opens
		if (isOpen) {
			errors = {
				email: '',
				full_name: '',
				password: '',
				level: ''
			};
		}
	});

	function validateForm() {
		let isValid = true;
		errors = {
			email: '',
			full_name: '',
			password: '',
			level: ''
		};

		// Email validation
		if (!formData.email.trim()) {
			errors.email = $t('common.user.form.email_required');
			isValid = false;
		} else if (!isValidEmail(formData.email)) {
			errors.email = 'Please enter a valid email address';
			isValid = false;
		}

		// Full name validation
		if (!formData.full_name.trim()) {
			errors.full_name = $t('common.user.form.full_name_required');
			isValid = false;
		}

		// Password validation (only for create mode)
		if (mode === 'create' && !formData.password.trim()) {
			errors.password = $t('common.user.form.password_required');
			isValid = false;
		} else if (mode === 'create' && formData.password.length < 8) {
			errors.password = $t('common.user.form.password_min');
			isValid = false;
		}

		// Level validation
		if (!formData.level) {
			errors.level = $t('common.user.form.level_required');
			isValid = false;
		}

		return isValid;
	}

	function isValidEmail(email: string) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	function handleSubmit() {
		if (!validateForm()) return;

		if (mode === 'create') {
			onSubmit({
				email: formData.email,
				full_name: formData.full_name,
				password: formData.password,
				level: formData.level,
				is_verified: formData.is_verified
			} as CreateUserRequest);
		} else {
			// For edit mode, we might need separate endpoints for profile and role
			onSubmit({
				full_name: formData.full_name
			} as UpdateProfileRequest);
		}
	}

	const levelOptions = [
		{ value: '0', label: $t('common.user.levels.0') },
		{ value: '1', label: $t('common.user.levels.1') }
	];

	// Convert level to string for Select component
	let selectedLevelString = $derived.by(() => {
		return formData.level;
	});

	// Update formData.level when selectedLevelString changes
	$effect(() => {
		if (selectedLevelString) {
			formData.level = selectedLevelString as '0' | '1';
		}
	});
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>
				{mode === 'create'
					? $t('common.user.form.create_title')
					: $t('common.user.form.edit_title')}
			</Dialog.Title>
			<Dialog.Description>
				{mode === 'create'
					? $t('common.user.form.create_description')
					: $t('common.user.form.edit_description')}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<!-- Email -->
				<div class="space-y-2 sm:col-span-2">
					<Label for="email">{$t('common.user.form.email')}</Label>
					<Input
						id="email"
						type="email"
						bind:value={formData.email}
						placeholder={$t('common.user.form.email_placeholder')}
						disabled={mode === 'edit'}
						class={errors.email ? 'border-red-500' : ''}
						required
					/>
					{#if errors.email}
						<p class="text-sm text-red-500">{errors.email}</p>
					{/if}
				</div>

				<!-- Full Name -->
				<div class="space-y-2 sm:col-span-2">
					<Label for="full_name">{$t('common.user.form.full_name')}</Label>
					<Input
						id="full_name"
						bind:value={formData.full_name}
						placeholder={$t('common.user.form.full_name_placeholder')}
						class={errors.full_name ? 'border-red-500' : ''}
						required
					/>
					{#if errors.full_name}
						<p class="text-sm text-red-500">{errors.full_name}</p>
					{/if}
				</div>

				<!-- Password (only for create mode) -->
				{#if mode === 'create'}
					<div class="space-y-2 sm:col-span-2">
						<Label for="password">{$t('common.user.form.password')}</Label>
						<Input
							id="password"
							type="password"
							bind:value={formData.password}
							placeholder={$t('common.user.form.password_placeholder')}
							class={errors.password ? 'border-red-500' : ''}
							required
						/>
						{#if errors.password}
							<p class="text-sm text-red-500">{errors.password}</p>
						{/if}
					</div>
				{/if}

				<!-- User Level -->
				<div class="space-y-2">
					<Label for="level">{$t('common.user.form.level')}</Label>
					<Select.Root type="single" bind:value={selectedLevelString}>
						<Select.Trigger class={errors.level ? 'border-red-500' : ''}>
							{levelOptions.find((opt) => opt.value === selectedLevelString)?.label ||
								$t('common.user.form.level_placeholder')}
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

				<!-- Email Verified (only for create mode) -->
				{#if mode === 'create'}
					<div class="flex items-center space-x-2">
						<input
							id="is_verified"
							type="checkbox"
							bind:checked={formData.is_verified}
							class="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
						/>
						<Label for="is_verified" class="text-sm">
							{$t('common.user.form.is_verified')}
						</Label>
					</div>
				{/if}
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={onClose}>
					{$t('common.user.form.cancel')}
				</Button>
				<Button type="button" disabled={isSubmitting} onclick={handleSubmit}>
					{#if isSubmitting}
						{mode === 'create' ? $t('common.user.form.creating') : $t('common.user.form.updating')}
					{:else}
						{mode === 'create'
							? $t('common.user.form.submit_create')
							: $t('common.user.form.submit_update')}
					{/if}
				</Button>
			</Dialog.Footer>
		</div>
	</Dialog.Content>
</Dialog.Root>
