<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Edit, Trash2, FileCheck, Plus, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import type { Transaction } from '$lib/types/transaction';
	import type { Category } from '$lib/types/category';
	import { t } from '$lib/i18n';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	interface Props {
		transactions?: Transaction[];
		categories?: Category[];
		isLoading?: boolean;
		onEdit?: (transaction: Transaction) => void;
		onDelete?: (transactionId: string) => void;
		onAdd?: () => void;
		onUpdate?: (transactionId: string, updatedData: Partial<Transaction>) => void;
		currentPage?: number;
		totalPages?: number;
		totalItems?: number;
		itemsPerPage?: number;
		onPageChange?: (page: number) => void;
	}

	let {
		transactions = [],
		categories = [],
		isLoading = false,
		onEdit = () => {},
		onDelete = () => {},
		onAdd = () => {},
		onUpdate = () => {},
		currentPage = 1,
		totalPages = 1,
		totalItems = 0,
		itemsPerPage = 10,
		onPageChange = () => {}
	}: Props = $props();

	let showProofDialog = $state(false);
	let selectedProof: string | null = $state(null);
	let selectedProofTransaction: Transaction | null = $state(null);

	let showEditDialog = $state(false);
	let editingTransaction: Transaction | null = $state(null);
	let editForm = $state({
		amount: 0,
		date: '',
		description: '',
		category: '',
		active: true
	});
	let isUpdating = $state(false);
	let updateMessage = $state('');

	let activeText = $state('');
	let inactiveText = $state('');

	$effect(() => {
		activeText = $t('common.status.active');
		inactiveText = $t('common.status.inactive');
	});

	function getCategoryName(categoryId: string): string {
		const category = categories.find((c) => c.id === categoryId);
		return category?.name || 'Unknown Category';
	}

	function openProofDialog(transaction: Transaction) {
		selectedProof = transaction.proof || null;
		selectedProofTransaction = transaction;
		showProofDialog = true;
	}

	async function handleUpdateTransaction(event: Event) {
		event.preventDefault();
		if (!editingTransaction || !onUpdate) return;

		try {
			isUpdating = true;
			updateMessage = '';

			await onUpdate(editingTransaction.id, editForm);

			showEditDialog = false;
			updateMessage = '';
		} catch (error) {
			console.error('Error updating transaction:', error);
			updateMessage = error instanceof Error ? error.message : 'Failed to update transaction';
		} finally {
			isUpdating = false;
		}
	}

	function formatAmount(amount: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('id-ID');
	}

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			onPageChange(page);
		}
	}

	function nextPage() {
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1);
		}
	}

	function prevPage() {
		if (currentPage > 1) {
			onPageChange(currentPage - 1);
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
{:else if transactions.length === 0}
	<div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
		<div class="text-center">
			<h3 class="text-lg font-medium">{$t('common.transaction.not_found')}</h3>
			<p class="mt-1 text-sm">Get started by creating your first transaction</p>
			<Button onclick={onAdd} class="mt-4">
				<Plus class="mr-2 h-4 w-4" />
				Add Transaction
			</Button>
		</div>
	</div>
{:else}
	<div class="w-full overflow-hidden rounded-md border">
		<div class="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="bg-muted/50">
					<tr class="text-left">
						<th class="min-w-[80px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.transaction.fields.date')}</th
						>
						<th class="min-w-[70px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.transaction.fields.type')}</th
						>
						<th class="min-w-[90px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.transaction.fields.category')}</th
						>
						<th class="min-w-[120px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.transaction.fields.description')}</th
						>
						<th class="min-w-[60px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.transaction.fields.active')}</th
						>
						<th class="min-w-[100px] p-2 text-right font-medium whitespace-nowrap sm:p-3"
							>{$t('common.transaction.fields.amount')}</th
						>
						<th class="min-w-[80px] p-2 text-right font-medium whitespace-nowrap sm:p-3"
							>{$t('common.transaction.fields.actions')}</th
						>
					</tr>
				</thead>
				<tbody>
					{#each transactions as t (t.id)}
						<tr class="border-t hover:bg-muted/30">
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">{formatDate(t.date)}</td>
							<td class="p-2 whitespace-nowrap sm:p-3">
								<span
									class={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${
										t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
									}`}
								>
									{t.type}
								</span>
							</td>
							<td
								class="max-w-[90px] truncate p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm"
								title={getCategoryName(t.category)}>{getCategoryName(t.category)}</td
							>
							<td
								class="max-w-[120px] truncate p-2 text-xs sm:max-w-[160px] sm:p-3 sm:text-sm"
								title={t.description || '-'}>{t.description || '-'}</td
							>
							<td class="p-2 whitespace-nowrap sm:p-3">
								<span
									class={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${
										t.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
									}`}
								>
									{t.active ? activeText : inactiveText}
								</span>
							</td>
							<td
								class="p-2 text-right text-xs font-medium whitespace-nowrap tabular-nums sm:p-3 sm:text-sm"
								>{formatAmount(t.amount)}</td
							>
							<td class="p-2 text-right whitespace-nowrap sm:p-3">
								<div class="flex items-center justify-end gap-1">
									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button size="icon" variant="ghost" onclick={() => onEdit(t)}>
													<Edit />
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>Edit</p>
											</Tooltip.Content>
										</Tooltip.Root>
									</Tooltip.Provider>
									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button size="icon" variant="destructive" onclick={() => onDelete(t.id)}>
													<Trash2 />
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>Delete</p>
											</Tooltip.Content>
										</Tooltip.Root>
									</Tooltip.Provider>

									{#if t.proof}
										<Button size="icon" variant="ghost" onclick={() => openProofDialog(t)}>
											<FileCheck size={12} />
										</Button>
									{/if}
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

	<!-- Pagination Controls -->
	{#if totalPages > 1}
		<div class="mt-4 flex items-center justify-between">
			<div class="text-sm text-muted-foreground">
				Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(
					currentPage * itemsPerPage,
					totalItems
				)} of {totalItems} transactions
			</div>

			<div class="flex items-center space-x-2">
				<Button
					variant="outline"
					size="sm"
					onclick={prevPage}
					disabled={currentPage === 1}
					class="h-8 w-8 p-0"
				>
					<ChevronLeft class="h-4 w-4" />
				</Button>

				<div class="flex items-center space-x-1">
					{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page (page)}
						{#if page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
							<Button
								variant={page === currentPage ? 'default' : 'outline'}
								size="sm"
								onclick={() => goToPage(page)}
								class="h-8 w-8 p-0"
							>
								{page}
							</Button>
						{:else if page === currentPage - 2 || page === currentPage + 2}
							<span class="px-2 text-muted-foreground">...</span>
						{/if}
					{/each}
				</div>

				<Button
					variant="outline"
					size="sm"
					onclick={nextPage}
					disabled={currentPage === totalPages}
					class="h-8 w-8 p-0"
				>
					<ChevronRight class="h-4 w-4" />
				</Button>
			</div>
		</div>
	{/if}
{/if}

{#if showProofDialog && selectedProofTransaction && selectedProof}
	<Dialog.Root bind:open={showProofDialog}>
		<Dialog.Content class="max-w-sm">
			<Dialog.Header>
				<Dialog.Title>Transaction Proof</Dialog.Title>
				{#if selectedProofTransaction}
					<Dialog.Description>
						{selectedProofTransaction.type === 'income' ? 'Income' : 'Expense'} -
						{getCategoryName(selectedProofTransaction.category)} -
						{formatAmount(selectedProofTransaction.amount)}
					</Dialog.Description>
				{/if}
			</Dialog.Header>
			<div class="mt-4">
				{#if selectedProof}
					<div class="flex justify-center">
						<img
							src={selectedProof}
							alt="Transaction proof"
							class="max-h-[400px] max-w-full rounded-lg object-contain shadow-lg"
							onerror={(e) => {
								const target = e.target;
								if (target) {
									target.style.display = 'none';
									const sibling = target.nextElementSibling;
									if (sibling) sibling.style.display = 'block';
								}
							}}
						/>
						<div class="hidden text-center text-muted-foreground">
							<p>Failed to load image</p>
							<Button
								variant="outline"
								onclick={() => selectedProof && window.open(selectedProof, '_blank')}
								class="mt-2"
							>
								Open in new tab
							</Button>
						</div>
					</div>
					<div class="mt-4 flex justify-center gap-2">
						<Button
							variant="outline"
							onclick={() => selectedProof && window.open(selectedProof, '_blank')}
						>
							Open in new tab
						</Button>
						<Button variant="outline" onclick={() => (showProofDialog = false)}>Close</Button>
					</div>
				{:else}
					<p class="text-center text-muted-foreground">No proof available</p>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/if}

<!-- Edit Transaction Dialog -->
<Dialog.Root bind:open={showEditDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Transaction</Dialog.Title>
			<Dialog.Description>Update the transaction details below.</Dialog.Description>
		</Dialog.Header>

		{#if editingTransaction}
			<form onsubmit={handleUpdateTransaction} class="space-y-4">
				{#if updateMessage}
					<div class="rounded bg-red-100 p-2 text-sm text-red-800">
						{updateMessage}
					</div>
				{/if}

				<div>
					<Label for="edit-amount">Amount</Label>
					<Input
						id="edit-amount"
						type="number"
						bind:value={editForm.amount}
						min="10000"
						step="1000"
						placeholder="Enter amount in IDR"
						required
					/>
				</div>

				<div>
					<Label for="edit-date">Date</Label>
					<Input
						id="edit-date"
						type="date"
						bind:value={editForm.date}
						max={new Date().toISOString().split('T')[0]}
						required
					/>
				</div>

				<div>
					<Label for="edit-description">Description</Label>
					<Input
						id="edit-description"
						bind:value={editForm.description}
						placeholder="Optional description"
						maxlength={255}
					/>
				</div>

				<div>
					<Label for="edit-category">Category</Label>
					<select
						id="edit-category"
						bind:value={editForm.category}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						required
					>
						<option value="">Select a category</option>
						{#each categories as category (category.id)}
							{#if category.active}
								<option value={category.id}>{category.name}</option>
							{/if}
						{/each}
					</select>
				</div>

				<div class="flex items-center space-x-2">
					<input id="edit-active" type="checkbox" bind:checked={editForm.active} class="rounded" />
					<Label for="edit-active">Active</Label>
				</div>

				<div class="flex gap-2">
					<Button type="submit" disabled={isUpdating} class="flex-1">
						{isUpdating ? 'Updating...' : 'Update Transaction'}
					</Button>
					<Button type="button" variant="outline" onclick={() => (showEditDialog = false)}>
						Cancel
					</Button>
				</div>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
