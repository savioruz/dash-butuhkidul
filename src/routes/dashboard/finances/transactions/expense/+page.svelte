<script lang="ts">
	import { onMount } from 'svelte';
	import { transactionsApi } from '$lib/api/transactions';
	import { categoriesApi } from '$lib/api/categories';
	import type { Transaction, GetTransactionsResponse } from '$lib/types/transaction';
	import type { Category } from '$lib/types/category';
	import type { CreateTransactionRequest } from '$lib/api/transactions';
	import TransactionList from '$lib/components/ui/transaction-list/transaction-list.svelte';
	import TransactionForm from '$lib/components/ui/transaction-form/transaction-form.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Plus, RefreshCw } from 'lucide-svelte';
	import { t } from '$lib/i18n';
	import { toast } from 'svelte-sonner';

	let transactions = $state<Transaction[]>([]);
	let categories = $state<Category[]>([]);
	let isLoading = $state(true);
	let showForm = $state(false);
	let editingTransaction = $state<Transaction | null>(null);
	let isSubmitting = $state(false);

	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalItems = $state(0);
	let itemsPerPage = $state(10);

	onMount(async () => {
		await Promise.all([loadTransactions(), loadCategories()]);
	});

	async function loadTransactions() {
		try {
			isLoading = true;
			const response = (await transactionsApi.getTransactions({
				type: 'expense',
				page: currentPage,
				limit: itemsPerPage
			})) as GetTransactionsResponse;

			transactions = response.data?.transactions || [];
			totalItems = response.data?.total_data || 0;
			totalPages = response.data?.total_page || 1;
		} catch (error) {
			console.error('Error loading expense transactions:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to load transactions');
		} finally {
			isLoading = false;
		}
	}

	async function loadCategories() {
		try {
			const response = await categoriesApi.getCategories();
			categories = response.data?.categories || [];
		} catch (error) {
			console.error('Error loading categories:', error);
		}
	}

	function handleAdd() {
		editingTransaction = null;
		showForm = true;
	}

	function handleEdit(transaction: Transaction) {
		editingTransaction = transaction;
		showForm = true;
	}

	async function handleSave(data: CreateTransactionRequest) {
		try {
			isSubmitting = true;

			if (editingTransaction) {
				await transactionsApi.updateTransaction(editingTransaction.id, data);
				toast.success('Transaction updated successfully!');
			} else {
				await transactionsApi.createTransaction(data);
				toast.success('Expense transaction created successfully!');
			}

			await loadTransactions();
			showForm = false;
			editingTransaction = null;
		} catch (error) {
			console.error('Error saving transaction:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to save transaction');
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDelete(transactionId: string) {
		try {
			await transactionsApi.deleteTransaction(transactionId);
			toast.success($t('common.transaction.messages.deleted'));
			await loadTransactions();
		} catch (error) {
			console.error('Error deleting transaction:', error);
			toast.error(
				error instanceof Error ? error.message : $t('common.transaction.messages.delete_error')
			);
		}
	}

	function handleCancel() {
		showForm = false;
		editingTransaction = null;
	}

	async function handleRefresh() {
		await loadTransactions();
		await loadCategories();
	}

	async function handlePageChange(page: number) {
		currentPage = page;
		await loadTransactions();
	}

	async function handleUpdate(transactionId: string, updatedData: Partial<Transaction>) {
		try {
			await transactionsApi.updateTransaction(transactionId, updatedData);
			toast.success('Transaction updated successfully');
			await loadTransactions();
		} catch (error) {
			console.error('Error updating transaction:', error);
			throw error;
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-lg font-bold tracking-tight md:text-3xl">
				{$t('common.transaction.expense.title')}
			</h1>
			<p class="text-xs text-muted-foreground md:text-base">
				{$t('common.transaction.expense.subtitle')}
			</p>
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
							<p>{$t('common.transaction.refresh')}</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<Button size="icon" onclick={handleAdd}>
								<Plus />
							</Button>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>{$t('common.transaction.expense.add')}</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			</div>
		{/if}
	</div>

	<!-- Form or List -->
	{#if showForm}
		<div class="flex justify-center">
			<TransactionForm
				{categories}
				type="expense"
				transaction={editingTransaction}
				isLoading={isSubmitting}
				onSave={handleSave}
				onCancel={handleCancel}
			/>
		</div>
	{:else}
		<TransactionList
			{transactions}
			{categories}
			{isLoading}
			onEdit={handleEdit}
			onDelete={handleDelete}
			onAdd={handleAdd}
			onUpdate={handleUpdate}
			{currentPage}
			{totalPages}
			{totalItems}
			{itemsPerPage}
			onPageChange={handlePageChange}
		/>
	{/if}
</div>
