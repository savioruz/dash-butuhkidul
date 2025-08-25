<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { Category } from '$lib/types/category';
	import { Save, X } from 'lucide-svelte';
	import { t } from '$lib/i18n';

	interface Props {
		category?: Category | null;
		isLoading?: boolean;
		onSave?: (data: { name: string; description: string; active: boolean }) => void;
		onCancel?: () => void;
	}

	let {
		category = null,
		isLoading = false,
		onSave = () => {},
		onCancel = () => {}
	}: Props = $props();

	let name = $state(category?.name || '');
	let description = $state(category?.description || '');
	let active = $state(category?.active ?? true);
	let errors = $state<{ name?: string; description?: string }>({});

	const isEdit = $derived(!!category);
	const title = $derived(
		isEdit ? $t('common.category.form.edit_title') : $t('common.category.form.add_title')
	);
	const submitText = $derived(
		isEdit ? $t('common.category.form.submit_update') : $t('common.category.form.submit_create')
	);

	function validateForm() {
		errors = {};

		if (!name.trim()) {
			errors.name = $t('common.category.form.name_required');
		} else if (name.trim().length < 2) {
			errors.name = $t('common.category.form.name_min_length');
		} else if (name.trim().length > 100) {
			errors.name = $t('common.category.form.name_max_length');
		}

		if (description && description.length > 255) {
			errors.description = $t('common.category.form.description_max_length');
		}

		return Object.keys(errors).length === 0;
	}

	function handleSubmit(event: Event) {
		event.preventDefault();

		if (!validateForm() || isLoading) {
			return;
		}

		onSave({
			name: name.trim(),
			description: description.trim(),
			active
		});
	}

	$effect(() => {
		if (category) {
			name = category.name;
			description = category.description || '';
			active = category.active;
		} else {
			name = '';
			description = '';
			active = true;
		}
		errors = {};
	});
</script>

<Card.Root class="w-full max-w-lg">
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			{title}
		</Card.Title>
		<Card.Description>
			{isEdit
				? $t('common.category.form.edit_description')
				: $t('common.category.form.add_description')}
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<form onsubmit={handleSubmit} class="space-y-6">
			<!-- Name Field -->
			<div class="space-y-2">
				<Label for="name" class="text-sm font-medium">
					{$t('common.category.form.name')} <span class="text-red-500">*</span>
				</Label>
				<Input
					id="name"
					type="text"
					bind:value={name}
					placeholder={$t('common.category.form.name_placeholder')}
					required
					disabled={isLoading}
					class={errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
				/>
				{#if errors.name}
					<p class="flex items-center gap-1 text-sm text-red-600">
						<span class="text-red-500">!</span>
						{errors.name}
					</p>
				{/if}
			</div>

			<!-- Description Field -->
			<div class="space-y-2">
				<Label for="description" class="text-sm font-medium">
					{$t('common.category.form.description')}
					<span class="text-gray-400">{$t('common.category.form.description_optional')}</span>
				</Label>
				<Input
					id="description"
					type="text"
					bind:value={description}
					placeholder={$t('common.category.form.description_placeholder')}
					disabled={isLoading}
					class={errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
				/>
				{#if errors.description}
					<p class="flex items-center gap-1 text-sm text-red-600">
						<span class="text-red-500">!</span>
						{errors.description}
					</p>
				{/if}
			</div>

			<!-- Active Toggle -->
			<div class="flex items-center space-x-3">
				<input
					id="active"
					type="checkbox"
					bind:checked={active}
					disabled={isLoading}
					class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
				/>
				<Label for="active" class="cursor-pointer text-sm font-medium">
					{$t('common.category.form.active')}
				</Label>
			</div>
			<p class="ml-7 text-xs text-gray-500">
				{$t('common.category.form.active_description')}
			</p>

			<!-- Action Buttons -->
			<div class="flex gap-3 pt-4">
				<Button
					type="submit"
					disabled={isLoading}
					class="flex flex-1 items-center justify-center gap-2"
				>
					{#if isLoading}
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
						></div>
						{isEdit ? $t('common.category.form.updating') : $t('common.category.form.creating')}
					{:else}
						<Save class="h-4 w-4" />
						{submitText}
					{/if}
				</Button>
				<Button
					type="button"
					variant="outline"
					onclick={onCancel}
					disabled={isLoading}
					class="flex items-center gap-2"
				>
					<X class="h-4 w-4" />
					{$t('common.category.form.cancel')}
				</Button>
			</div>
		</form>
	</Card.Content>
</Card.Root>
