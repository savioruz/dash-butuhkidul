<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Edit, Trash2, Plus, FileText, Image } from 'lucide-svelte';
	import type { Article } from '$lib/types/article';
	import type { UpdateArticleRequest } from '$lib/types/article';
	import { t } from '$lib/i18n';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { MarkdownEditor } from '$lib/components/ui/markdown-editor/index.js';

	interface Props {
		articles?: Article[];
		isLoading?: boolean;
		onDelete?: (articleId: string) => void;
		onAdd?: () => void;
		onUpdate?: (articleId: string, updatedData: UpdateArticleRequest, file?: File | null) => void;
	}

	let {
		articles = [],
		isLoading = false,
		onDelete = () => {},
		onAdd = () => {},
		onUpdate = () => {}
	}: Props = $props();

	let showEditDialog = $state(false);
	let showCoverDialog = $state(false);
	let editingArticle: Article | null = $state(null);
	let viewingCoverArticle: Article | null = $state(null);
	let editForm = $state({
		title: '',
		content: '',
		active: true,
		published_at: ''
	});
	let editFormActiveStatus = $state('true');
	let selectedFile: File | null = $state(null);
	let isUpdating = $state(false);

	function openEditDialog(article: Article) {
		editingArticle = article;
		editForm = {
			title: article.title,
			content: article.content,
			active: article.active,
			published_at: formatDateForInput(article.published_at)
		};
		editFormActiveStatus = article.active.toString();
		selectedFile = null;
		showEditDialog = true;
	}

	function openCoverDialog(article: Article) {
		viewingCoverArticle = article;
		showCoverDialog = true;
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('id-ID');
	}

	function formatDateForInput(dateString?: string): string {
		if (!dateString) return '';

		// Convert from API format (2006-01-02 15:04:05) to datetime-local format (2006-01-02T15:04)
		if (dateString.includes(' ')) {
			return dateString.replace(' ', 'T').substring(0, 16);
		}

		// If already in ISO format, just return the first 16 chars
		return dateString.substring(0, 16);
	}

	function getStatusColor(active: boolean) {
		return active
			? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
			: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
	}

	function truncateText(text: string, maxLength: number = 100) {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	}

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			selectedFile = target.files[0];
		}
	}

	async function handleUpdate() {
		if (!editingArticle) return;

		isUpdating = true;
		try {
			const updateData = {
				title: editForm.title,
				content: editForm.content,
				active: editFormActiveStatus,
				published_at: editForm.published_at || undefined
			};
			await onUpdate(editingArticle.id, updateData, selectedFile);
			showEditDialog = false;
		} catch (error) {
			console.error('Error updating article:', error);
		} finally {
			isUpdating = false;
		}
	}

	function handleDelete(articleId: string) {
		const article = articles.find((a) => a.id === articleId);
		if (
			article &&
			confirm(`Are you sure you want to delete "${article.title}"? This action cannot be undone.`)
		) {
			onDelete(articleId);
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
	{:else if articles.length === 0}
		<div class="py-12 text-center">
			<FileText class="mx-auto h-12 w-12 text-gray-400" />
			<h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
				{$t('common.article.no_articles')}
			</h3>
			<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
				{$t('common.article.no_articles_description')}
			</p>
			<div class="mt-6">
				<Button onclick={onAdd}>
					<Plus class="mr-2 h-4 w-4" />
					{$t('common.article.add')}
				</Button>
			</div>
		</div>
	{:else}
		<div class="w-full overflow-hidden rounded-md border">
			<div class="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-muted/50">
						<tr class="text-left">
							<th class="min-w-[200px] p-2 font-medium whitespace-nowrap sm:p-3"
								>{$t('common.article.table.title')}</th
							>
							<th class="min-w-[120px] p-2 font-medium whitespace-nowrap sm:p-3"
								>{$t('common.article.table.author')}</th
							>
							<th class="min-w-[300px] p-2 font-medium whitespace-nowrap sm:p-3"
								>{$t('common.article.table.content')}</th
							>
							<th class="min-w-[80px] p-2 font-medium whitespace-nowrap sm:p-3"
								>{$t('common.article.table.status')}</th
							>
							<th class="min-w-[100px] p-2 font-medium whitespace-nowrap sm:p-3"
								>{$t('common.article.table.created')}</th
							>
							<th class="min-w-[120px] p-2 text-right font-medium whitespace-nowrap sm:p-3"
								>{$t('common.article.table.actions')}</th
							>
						</tr>
					</thead>
					<tbody>
						{#each articles as article (article.id)}
							<tr class="border-t hover:bg-muted/30">
								<td class="p-2 font-medium whitespace-nowrap sm:p-3">
									<div class="flex items-center gap-2">
										<span class="max-w-[180px] truncate" title={article.title}>
											{article.title}
										</span>
									</div>
								</td>
								<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
									{article.created_by}
								</td>
								<td
									class="max-w-[300px] truncate p-2 text-xs sm:p-3 sm:text-sm"
									title={article.content}
								>
									{truncateText(article.content, 100)}
								</td>
								<td class="p-2 whitespace-nowrap sm:p-3">
									<span
										class={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(article.active)}`}
									>
										{article.active
											? $t('common.article.status.active')
											: $t('common.article.status.inactive')}
									</span>
								</td>
								<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
									{formatDate(article.created_at)}
								</td>
								<td class="p-2 text-right whitespace-nowrap sm:p-3">
									<div class="flex justify-end gap-1">
										{#if article.cover_url}
											<Tooltip.Root>
												<Tooltip.Trigger>
													<Button
														size="icon"
														variant="outline"
														onclick={() => openCoverDialog(article)}
													>
														<Image class="h-4 w-4" />
													</Button>
												</Tooltip.Trigger>
												<Tooltip.Content>
													<p>{$t('common.article.viewCover')}</p>
												</Tooltip.Content>
											</Tooltip.Root>
										{/if}

										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button size="icon" variant="ghost" onclick={() => openEditDialog(article)}>
													<Edit class="h-4 w-4" />
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>{$t('common.article.edit')}</p>
											</Tooltip.Content>
										</Tooltip.Root>

										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button
													size="icon"
													variant="destructive"
													onclick={() => handleDelete(article.id)}
												>
													<Trash2 class="h-4 w-4" />
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>{$t('common.article.delete')}</p>
											</Tooltip.Content>
										</Tooltip.Root>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Cover Image Dialog -->
			<Dialog.Root bind:open={showCoverDialog}>
				<Dialog.Content class="max-h-[80vh] max-w-3xl">
					<Dialog.Header>
						<Dialog.Title>{$t('common.article.coverImage')}</Dialog.Title>
						<Dialog.Description>
							{viewingCoverArticle?.title || $t('common.article.coverImageDefault')}
						</Dialog.Description>
					</Dialog.Header>

					<div class="flex items-center justify-center">
						{#if viewingCoverArticle?.cover_url}
							<img
								src={viewingCoverArticle.cover_url}
								alt={`Cover for ${viewingCoverArticle.title}`}
								class="max-h-[60vh] max-w-full rounded-lg object-contain"
							/>
						{:else}
							<p class="text-muted-foreground">{$t('common.article.noCover')}</p>
						{/if}
					</div>
				</Dialog.Content>
			</Dialog.Root>
			<div
				class="block border-t bg-muted/20 p-2 text-center text-xs text-muted-foreground sm:hidden"
			>
				← Scroll to see more →
			</div>
		</div>
	{/if}
</div>

<!-- Edit Article Dialog -->
<Dialog.Root bind:open={showEditDialog}>
	<Dialog.Content class="max-h-[85vh] max-w-xl overflow-y-auto md:max-w-4xl lg:max-w-5xl">
		<Dialog.Header>
			<Dialog.Title>{$t('common.article.editTitle')}</Dialog.Title>
			<Dialog.Description>Update the article information below.</Dialog.Description>
		</Dialog.Header>
		<form onsubmit={handleUpdate} class="space-y-4">
			<div class="grid gap-4">
				<div>
					<Label for="edit-title">{$t('common.article.form.title')} *</Label>
					<Input
						id="edit-title"
						bind:value={editForm.title}
						placeholder="Enter article title"
						required
					/>
				</div>

				<div>
					<Label for="edit-active">{$t('common.article.form.status')}</Label>
					<div class="flex items-center space-x-2">
						<input
							id="edit-active"
							type="checkbox"
							bind:checked={editForm.active}
							class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						/>
						<label for="edit-active" class="text-sm font-medium">
							{$t('common.article.status.active')}
						</label>
					</div>
				</div>

				<div>
					<Label for="edit-published"
						>{$t('common.article.form.published_date')}
						{$t('common.article.form.published_date_optional')}</Label
					>
					<Input
						id="edit-published"
						type="datetime-local"
						bind:value={editForm.published_at}
						placeholder="YYYY-MM-DD HH:MM:SS"
					/>
					<p class="mt-1 text-xs text-muted-foreground">
						{$t('common.article.form.published_date_description')}
					</p>
				</div>

				<div>
					<Label for="edit-cover">{$t('common.article.form.coverImage')}</Label>
					<Input id="edit-cover" type="file" accept="image/*" onchange={handleFileChange} />
					{#if selectedFile}
						<p class="mt-1 text-sm text-muted-foreground">
							Selected: {selectedFile.name}
						</p>
					{/if}
				</div>

				<div>
					<MarkdownEditor
						bind:value={editForm.content}
						placeholder={$t('common.article.form.contentPlaceholder')}
						label={$t('common.article.form.content')}
						rows={8}
						required={true}
					/>
				</div>
			</div>
		</form>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showEditDialog = false)}
				>{$t('common.article.cancel')}</Button
			>
			<Button onclick={handleUpdate} disabled={isUpdating}>
				{isUpdating ? $t('common.article.updating') : $t('common.article.updateButton')}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
