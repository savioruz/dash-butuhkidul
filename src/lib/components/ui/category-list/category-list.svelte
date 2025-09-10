<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Edit, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import type { Category } from '$lib/types/category';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { t } from '$lib/i18n';

	interface Props {
		categories?: Category[];
		isLoading?: boolean;
		onEdit?: (category: Category) => void;
		onDelete?: (categoryId: string) => void;
		onAdd?: () => void;
		currentPage?: number;
		totalPages?: number;
		totalItems?: number;
		itemsPerPage?: number;
		onPageChange?: (page: number) => void;
	}

	let {
		categories = [],
		isLoading = false,
		onEdit = () => {},
		onDelete = () => {},
		onAdd = () => {},
		currentPage = 1,
		totalPages = 1,
		totalItems = 0,
		itemsPerPage = 10,
		onPageChange = () => {}
	}: Props = $props();

	function openDeleteDialog(category: Category) {
		if (
			confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)
		) {
			onDelete(category.id);
		}
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

<div class="space-y-4">
	{#if isLoading}
		<div class="flex items-center justify-center py-8 text-muted-foreground">
			<div class="flex items-center gap-2">
				<div
					class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
				></div>
				{$t('common.loading')}
			</div>
		</div>
	{:else if categories.length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
			<div class="text-center">
				<h3 class="text-lg font-medium">{$t('common.category.list.empty_title')}</h3>
				<p class="mt-1 text-sm">{$t('common.category.list.empty_subtitle')}</p>
				<Button onclick={onAdd} class="mt-4">
					<Plus class="mr-2 h-4 w-4" />
					{$t('common.category.add')}
				</Button>
			</div>
		</div>
	{:else}
		<!-- Responsive table wrapper with horizontal scroll -->
		<div class="w-full overflow-hidden rounded-md border">
			<div class="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-muted/50">
						<tr class="text-left">
							<th class="min-w-[120px] p-2 font-medium whitespace-nowrap sm:p-3"
								>{$t('common.category.list.name')}</th
							>
							<th class="min-w-[200px] p-2 font-medium whitespace-nowrap sm:p-3"
								>{$t('common.category.list.description')}</th
							>
							<th class="min-w-[60px] p-2 font-medium whitespace-nowrap sm:p-3"
								>{$t('common.category.list.status')}</th
							>
							<th class="min-w-[100px] p-2 font-medium whitespace-nowrap sm:p-3">Created</th>
							<th class="min-w-[120px] p-2 text-right font-medium whitespace-nowrap sm:p-3"
								>{$t('common.category.list.actions')}</th
							>
						</tr>
					</thead>
					<tbody>
						{#each categories as category (category.id)}
							<tr class="border-t hover:bg-muted/30">
								<td class="p-2 font-medium whitespace-nowrap sm:p-3">{category.name}</td>
								<td
									class="max-w-[200px] truncate p-2 text-xs sm:p-3 sm:text-sm"
									title={category.description || '-'}
								>
									{category.description || '-'}
								</td>
								<td class="p-2 whitespace-nowrap sm:p-3">
									<span
										class={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
											category.active
												? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
												: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
										}`}
									>
										{category.active ? $t('common.status.active') : $t('common.status.inactive')}
									</span>
								</td>
								<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
									{formatDate(category.created_at)}
								</td>
								<td class="p-2 text-right whitespace-nowrap sm:p-3">
									<div class="flex justify-end gap-1">
										<Tooltip.Provider>
											<Tooltip.Root>
												<Tooltip.Trigger>
													<Button size="icon" variant="ghost" onclick={() => onEdit(category)}>
														<Edit />
													</Button>
												</Tooltip.Trigger>
												<Tooltip.Content>
													<p>{$t('common.category.list.edit')}</p>
												</Tooltip.Content>
											</Tooltip.Root>
										</Tooltip.Provider>
										<Tooltip.Provider>
											<Tooltip.Root>
												<Tooltip.Trigger>
													<Button
														size="icon"
														variant="destructive"
														onclick={() => openDeleteDialog(category)}
													>
														<Trash2 />
													</Button>
												</Tooltip.Trigger>
												<Tooltip.Content>
													<p>{$t('common.category.list.delete')}</p>
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

			<!-- Scroll indicator for mobile -->
			<div
				class="block border-t bg-muted/20 p-2 text-center text-xs text-muted-foreground sm:hidden"
			>
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
					)} of {totalItems} categories
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
</div>
