<script lang="ts">
	import { onMount } from 'svelte';
	import { categoriesApi } from '$lib/api/categories';
	import type { Category } from '$lib/types/category';
	import CategoryList from '$lib/components/ui/category-list/category-list.svelte';
	import CategoryForm from '$lib/components/ui/category-form/category-form.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Plus, RefreshCw } from 'lucide-svelte';
	import { t } from '$lib/i18n';

	let categories = $state<Category[]>([]);
	let isLoading = $state(true);
	let showForm = $state(false);
	let editingCategory = $state<Category | null>(null);
	let isSubmitting = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalItems = $state(0);
	let itemsPerPage = $state(10);

	onMount(async () => {
		await loadCategories();
	});

	async function loadCategories() {
		try {
			isLoading = true;
			errorMessage = '';
			const response = await categoriesApi.getCategories({
				page: currentPage,
				limit: itemsPerPage
			});
			categories = response.data?.categories || [];
			totalItems = response.data?.total_data || 0;
			totalPages = response.data?.total_page || 1;
		} catch (error) {
			console.error('Error loading categories:', error);
			errorMessage =
				error instanceof Error ? error.message : $t('common.category.messages.load_error');
		} finally {
			isLoading = false;
		}
	}

	function handleAdd() {
		editingCategory = null;
		showForm = true;
		errorMessage = '';
		successMessage = '';
	}

	function handleEdit(category: Category) {
		editingCategory = category;
		showForm = true;
		errorMessage = '';
		successMessage = '';
	}

	async function handleSave(data: { name: string; description: string; active: boolean }) {
		try {
			isSubmitting = true;
			errorMessage = '';
			successMessage = '';

			if (editingCategory) {
				await categoriesApi.updateCategory(editingCategory.id, data);
				successMessage = $t('common.category.messages.updated');
			} else {
				await categoriesApi.createCategory(data);
				successMessage = $t('common.category.messages.created');
			}

			await loadCategories();
			showForm = false;
			editingCategory = null;
		} catch (error) {
			console.error('Error saving category:', error);
			errorMessage =
				error instanceof Error
					? error.message
					: editingCategory
						? $t('common.category.messages.update_error')
						: $t('common.category.messages.create_error');
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDelete(categoryId: string) {
		try {
			errorMessage = '';
			successMessage = '';
			await categoriesApi.deleteCategory(categoryId);
			successMessage = $t('common.category.messages.deleted');
			await loadCategories();
		} catch (error) {
			console.error('Error deleting category:', error);
			errorMessage =
				error instanceof Error ? error.message : $t('common.category.messages.delete_error');
		}
	}

	function handleCancel() {
		showForm = false;
		editingCategory = null;
		errorMessage = '';
		successMessage = '';
	}

	async function handleRefresh() {
		await loadCategories();
	}

	function dismissMessage() {
		errorMessage = '';
		successMessage = '';
	}

	async function handlePageChange(page: number) {
		currentPage = page;
		await loadCategories();
	}
</script>

<div class="space-y-6 py-2">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-lg font-bold tracking-tight md:text-3xl">{$t('common.category.title')}</h1>
			<p class="text-xs text-muted-foreground md:text-base">{$t('common.category.subtitle')}</p>
		</div>
		{#if !showForm}
			<div class="flex gap-2">
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<Button size="icon" variant="outline" onclick={handleRefresh} disabled={isLoading}>
								<RefreshCw />
							</Button>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>{$t('common.category.refresh')}</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<Button size="icon" variant="default" onclick={handleAdd}>
								<Plus />
							</Button>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>{$t('common.transaction.add')}</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			</div>
		{/if}
	</div>

	<!-- Success Message -->
	{#if successMessage}
		<Card.Root class="border-green-200 bg-green-50">
			<Card.Content>
				<div class="flex items-center justify-between">
					<p class="text-green-600">{successMessage}</p>
					<Button
						variant="ghost"
						onclick={dismissMessage}
						size="sm"
						class="text-green-600 hover:text-green-700"
					>
						×
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Error Message -->
	{#if errorMessage}
		<Card.Root class="border-red-200 bg-red-50">
			<Card.Content>
				<div class="flex items-center justify-between">
					<p class="text-red-600">{errorMessage}</p>
					<Button
						variant="ghost"
						onclick={dismissMessage}
						size="sm"
						class="text-red-600 hover:text-red-700"
					>
						×
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Form or List -->
	{#if showForm}
		<div class="flex justify-center">
			<CategoryForm
				category={editingCategory}
				isLoading={isSubmitting}
				onSave={handleSave}
				onCancel={handleCancel}
			/>
		</div>
	{:else}
		<CategoryList
			{categories}
			{isLoading}
			onAdd={handleAdd}
			onEdit={handleEdit}
			onDelete={handleDelete}
			{currentPage}
			{totalPages}
			{totalItems}
			{itemsPerPage}
			onPageChange={handlePageChange}
		/>
	{/if}
</div>
