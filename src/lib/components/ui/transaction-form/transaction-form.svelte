<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { AsyncCombobox } from '$lib/components/ui/combobox';
	import { categoriesApi } from '$lib/api/categories';
	import type { CreateTransactionRequest } from '$lib/api/transactions';
	import type { Transaction } from '$lib/types/transaction';
	import type { Category } from '$lib/types/category';
	import { t } from '$lib/i18n';

	interface Props {
		categories: Category[];
		type: 'income' | 'expense';
		transaction?: Transaction | null;
		isLoading?: boolean;
		onSave?: (data: CreateTransactionRequest) => void;
		onCancel?: () => void;
	}

	let {
		categories,
		type,
		transaction = null,
		isLoading = false,
		onSave = () => {},
		onCancel = () => {}
	}: Props = $props();
	let formData = $state({
		amount: transaction?.amount || 0,
		date: transaction?.date || new Date().toISOString().split('T')[0],
		type: type,
		description: transaction?.description || '',
		category: transaction?.category || '',
		active: transaction?.active ?? true
	});
	let selectedFile: File | null = $state(null);
	let message = $state('');

	const isEdit = $derived(!!transaction);
	const title = $derived(
		isEdit
			? $t('common.transaction.forms.edit_transaction')
			: type === 'income'
				? $t('common.transaction.forms.add_income')
				: $t('common.transaction.forms.add_expense')
	);
	const submitText = $derived(
		isEdit ? $t('common.transaction.forms.update') : $t('common.transaction.forms.submit')
	);

	// Fetch categories function for AsyncCombobox
	async function fetchCategories(query: string) {
		try {
			// If no query, return initial categories from props
			if (!query && categories.length > 0) {
				return categories
					.filter((c) => c.active)
					.map((c) => ({
						label: c.name,
						value: c.id
					}));
			}

			// Otherwise, fetch from API with search
			const response = await categoriesApi.getCategories({
				limit: 10,
				name: query || undefined
			});

			if (response?.data?.categories) {
				return response.data.categories
					.filter((c) => c.active)
					.map((c) => ({
						label: c.name,
						value: c.id
					}));
			}

			return [];
		} catch (error) {
			console.error('Error fetching categories:', error);
			return [];
		}
	}

	function handleCategorySelect(categoryId: string) {
		formData.category = categoryId;
	}

	$effect(() => {
		if (transaction) {
			formData.amount = transaction.amount;
			formData.date = transaction.date;
			formData.description = transaction.description || '';
			formData.category = transaction.category;
			formData.active = transaction.active;
		} else {
			formData = {
				amount: 0,
				date: new Date().toISOString().split('T')[0],
				type: type,
				description: '',
				category: '',
				active: true
			};
		}
		selectedFile = null;
		message = '';
	});

	function validateForm() {
		if (!formData.category) {
			message = 'Please select a category';
			return false;
		}

		if (formData.amount <= 0) {
			message = 'Amount must be greater than 0';
			return false;
		}

		return true;
	}

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];
			// Check file size (max 2MB)
			if (file.size > 2 * 1024 * 1024) {
				message = 'File size must be less than 2MB';
				target.value = '';
				return;
			}
			// Check file type
			const allowedTypes = [
				'image/jpeg',
				'image/png',
				'image/gif',
				'image/webp',
				'application/pdf'
			];
			if (!allowedTypes.includes(file.type)) {
				message = 'Please select an image file (JPEG, PNG, GIF, WebP) or PDF';
				target.value = '';
				return;
			}
			selectedFile = file;
			message = '';
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			message = '';

			const requestData: CreateTransactionRequest = {
				amount: formData.amount,
				date: formData.date,
				type: formData.type,
				description: formData.description,
				category: formData.category,
				active: formData.active
			};

			if (selectedFile) {
				requestData.file = selectedFile;
			}

			onSave(requestData);
		} catch (error) {
			console.error('Error in form submit:', error);
			message =
				error instanceof Error ? error.message : 'An error occurred while processing the form';
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-semibold">{title}</h2>
	</div>

	<form onsubmit={handleSubmit} class="space-y-4">
		{#if message}
			<div
				class={`rounded p-2 text-sm ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
			>
				{message}
			</div>
		{/if}

		<div>
			<Label for="amount">{$t('common.transaction.fields.amount')}</Label>
			<Input
				id="amount"
				type="number"
				bind:value={formData.amount}
				min="10000"
				step="1000"
				placeholder="Enter amount in IDR"
				required
			/>
		</div>

		<div>
			<Label for="date">{$t('common.transaction.fields.date')}</Label>
			<Input
				id="date"
				type="date"
				bind:value={formData.date}
				max={new Date().toISOString().split('T')[0]}
				required
			/>
		</div>

		<div>
			<Label for="description">{$t('common.transaction.fields.description')}</Label>
			<Input
				id="description"
				bind:value={formData.description}
				placeholder="Optional description of the transaction"
				maxlength={255}
			/>
		</div>

		<div>
			<Label for="category">{$t('common.transaction.fields.category')} *</Label>
			<AsyncCombobox
				fetchOptions={fetchCategories}
				placeholder="Select a category"
				searchPlaceholder="Search categories..."
				emptyText="No categories found."
				loadingText="Loading categories..."
				buttonClass="w-full"
				onSelect={handleCategorySelect}
				required
				showError={!formData.category && !!message}
				bind:value={formData.category}
				debounceMs={300}
			/>
		</div>

		<div>
			<Label for="proof">{$t('common.transaction.fields.proof')} (Optional)</Label>
			<Input id="proof" type="file" accept="image/*,.pdf" onchange={handleFileChange} />
			<p class="mt-1 text-xs text-gray-500">
				Upload an image (JPEG, PNG, GIF, WebP) or PDF file (max 2MB) - Optional
			</p>
			{#if selectedFile}
				<p class="mt-1 text-xs text-green-600">
					Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
				</p>
			{/if}
		</div>

		<div class="flex items-center space-x-2">
			<input id="active" type="checkbox" bind:checked={formData.active} class="rounded" />
			<Label for="active">{$t('common.transaction.fields.active')}</Label>
		</div>

		<div class="flex gap-2">
			<Button type="submit" disabled={isLoading} class="flex-1">
				{isLoading ? $t('common.transaction.forms.submitting') : submitText}
			</Button>
			<Button type="button" variant="outline" onclick={onCancel}>
				{$t('common.actions.cancel')}
			</Button>
		</div>
	</form>
</div>
