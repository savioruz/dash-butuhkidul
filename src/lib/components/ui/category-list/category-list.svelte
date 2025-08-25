<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Edit, Trash2, Plus } from 'lucide-svelte';
	import type { Category } from '$lib/types/category';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { t } from '$lib/i18n';

	interface Props {
		categories?: Category[];
		isLoading?: boolean;
		onEdit?: (category: Category) => void;
		onDelete?: (categoryId: string) => void;
		onAdd?: () => void;
	}

	let {
		categories = [],
		isLoading = false,
		onEdit = () => {},
		onDelete = () => {},
		onAdd = () => {}
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
	{/if}
</div>
