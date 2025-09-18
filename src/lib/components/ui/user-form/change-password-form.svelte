<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { t } from '$lib/i18n';
	import type { ChangePasswordRequest, User } from '$lib/types/user';

	interface Props {
		isOpen: boolean;
		user?: User | null;
		isSubmitting?: boolean;
		onClose: () => void;
		onSubmit: (data: ChangePasswordRequest) => void;
	}

	let {
		isOpen = $bindable(),
		user = null,
		isSubmitting = false,
		onClose,
		onSubmit
	}: Props = $props();

	let formData = $state({
		current_password: '',
		new_password: ''
	});

	let errors = $state({
		current_password: '',
		new_password: ''
	});

	// Reset form when dialog opens/closes
	$effect(() => {
		if (isOpen) {
			formData = {
				current_password: '',
				new_password: ''
			};
			errors = {
				current_password: '',
				new_password: ''
			};
		}
	});

	function validateForm() {
		let isValid = true;
		errors = {
			current_password: '',
			new_password: ''
		};

		// Current password validation
		if (!formData.current_password.trim()) {
			errors.current_password = $t('common.user.form.password_required');
			isValid = false;
		}

		// New password validation
		if (!formData.new_password.trim()) {
			errors.new_password = $t('common.user.form.password_required');
			isValid = false;
		} else if (formData.new_password.length < 8) {
			errors.new_password = $t('common.user.form.password_min');
			isValid = false;
		}

		return isValid;
	}

	function handleSubmit() {
		if (!validateForm()) return;

		onSubmit({
			current_password: formData.current_password,
			new_password: formData.new_password
		});
	}
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Content class="sm:max-w-[400px]">
		<Dialog.Header>
			<Dialog.Title>{$t('common.user.form.change_password_title')}</Dialog.Title>
			<Dialog.Description>
				{$t('common.user.form.change_password_description')}
				{#if user}
					for {user.full_name}
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<!-- Current Password -->
			<div class="space-y-2">
				<Label for="current_password">{$t('common.user.form.old_password')}</Label>
				<Input
					id="current_password"
					type="password"
					bind:value={formData.current_password}
					placeholder={$t('common.user.form.old_password_placeholder')}
					class={errors.current_password ? 'border-red-500' : ''}
					required
				/>
				{#if errors.current_password}
					<p class="text-sm text-red-500">{errors.current_password}</p>
				{/if}
			</div>

			<!-- New Password -->
			<div class="space-y-2">
				<Label for="new_password">{$t('common.user.form.new_password')}</Label>
				<Input
					id="new_password"
					type="password"
					bind:value={formData.new_password}
					placeholder={$t('common.user.form.new_password_placeholder')}
					class={errors.new_password ? 'border-red-500' : ''}
					required
				/>
				{#if errors.new_password}
					<p class="text-sm text-red-500">{errors.new_password}</p>
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={onClose}>
				{$t('common.user.form.cancel')}
			</Button>
			<Button type="button" disabled={isSubmitting} onclick={handleSubmit}>
				{#if isSubmitting}
					{$t('common.user.form.changing_password')}
				{:else}
					{$t('common.user.form.submit_change_password')}
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
