<script lang="ts">
	import { onMount } from 'svelte';
	import { articleApi } from '$lib/api/articles';
	import { ArticleList } from '$lib/components/ui/article-list';
	import type { Article, CreateArticleRequest, UpdateArticleRequest } from '$lib/types/article';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { MarkdownEditor } from '$lib/components/ui/markdown-editor/index.js';
	import { RefreshCw, Plus } from 'lucide-svelte';
	import { t } from '$lib/i18n';

	let articles = $state<Article[]>([]);
	let isLoading = $state(true);
	let errorMessage = $state('');
	let successMessage = $state('');
	let showAddDialog = $state(false);
	let isCreating = $state(false);

	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalItems = $state(0);
	let itemsPerPage = $state(10);

	let addForm = $state({
		title: '',
		content: '',
		active: true,
		published_at: ''
	});
	let addFormActiveStatus = $state('true');
	let selectedFile: File | null = $state(null);

	// Draft functionality
	let isDraft = $state(false);
	let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;
	let lastSaved = $state<Date | null>(null);
	let draftKey = 'article-draft';

	// Auto-save functionality
	function scheduleAutoSave() {
		if (autoSaveTimer) {
			clearTimeout(autoSaveTimer);
		}
		autoSaveTimer = setTimeout(() => {
			saveDraft();
		}, 2000); // Auto-save every 2 seconds after user stops typing
	}

	function saveDraft() {
		if (!addForm.title.trim() && !addForm.content.trim()) {
			return; // Don't save empty drafts
		}

		const draftData = {
			...addForm,
			selectedFileName: selectedFile?.name || null,
			savedAt: new Date().toISOString()
		};

		localStorage.setItem(draftKey, JSON.stringify(draftData));
		lastSaved = new Date();
		isDraft = true;
	}

	function loadDraft() {
		try {
			const saved = localStorage.getItem(draftKey);
			if (saved) {
				const draftData = JSON.parse(saved);
				addForm = {
					title: draftData.title || '',
					content: draftData.content || '',
					active: draftData.active !== undefined ? draftData.active : true,
					published_at: draftData.published_at || ''
				};
				addFormActiveStatus = addForm.active ? 'true' : 'false';
				lastSaved = new Date(draftData.savedAt);
				isDraft = true;
				return true;
			}
		} catch (error) {
			console.error('Error loading draft:', error);
		}
		return false;
	}

	function clearDraft() {
		localStorage.removeItem(draftKey);
		isDraft = false;
		lastSaved = null;
	}

	function restoreDraft() {
		if (loadDraft()) {
			showAddDialog = true;
		}
	}

	// Watch for changes to auto-save
	$effect(() => {
		if (showAddDialog && (addForm.title || addForm.content)) {
			scheduleAutoSave();
		}
	});

	onMount(async () => {
		await loadArticles();
		// Check for existing draft
		loadDraft();
	});

	// Add beforeunload listener separately
	$effect(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('beforeunload', handleBeforeUnload);

			// Cleanup function
			return () => {
				window.removeEventListener('beforeunload', handleBeforeUnload);
				if (autoSaveTimer) {
					clearTimeout(autoSaveTimer);
				}
			};
		}
	});

	async function loadArticles() {
		try {
			isLoading = true;
			errorMessage = '';
			const response = await articleApi.getArticles({
				page: currentPage,
				limit: itemsPerPage
			});

			// Handle the API response structure: { data: { articles: [...] } }
			if (response && typeof response === 'object') {
				if ('data' in response && response.data && 'articles' in response.data) {
					articles = response.data.articles;
					totalItems = response.data.total_data || 0;
					totalPages = response.data.total_page || 1;
				} else if ('articles' in response && response.articles) {
					articles = response.articles;
				} else {
					articles = [];
				}
			} else {
				articles = [];
			}
		} catch (err) {
			console.error('Error loading articles:', err);
			errorMessage = err instanceof Error ? err.message : 'Failed to load articles';
			articles = [];
		} finally {
			isLoading = false;
		}
	}

	async function handleUpdate(
		articleId: string,
		updatedData: UpdateArticleRequest,
		file?: File | null
	) {
		try {
			errorMessage = '';
			successMessage = '';
			await articleApi.updateArticle(articleId, updatedData, file || undefined);
			successMessage = $t('common.article.messages.update_success');
			await loadArticles();
		} catch (err) {
			console.error('Error updating article:', err);
			errorMessage =
				err instanceof Error ? err.message : $t('common.article.messages.update_error');
			throw err;
		}
	}

	async function handleDelete(articleId: string) {
		if (!confirm($t('common.article.confirm_delete'))) {
			return;
		}

		try {
			errorMessage = '';
			successMessage = '';
			await articleApi.deleteArticle(articleId);
			successMessage = $t('common.article.messages.delete_success');
			await loadArticles();
		} catch (err) {
			console.error('Error deleting article:', err);
			errorMessage =
				err instanceof Error ? err.message : $t('common.article.messages.delete_error');
		}
	}

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			selectedFile = target.files[0];
		}
	}

	async function handleAdd() {
		if (!addForm.title.trim() || !addForm.content.trim()) {
			return;
		}

		isCreating = true;
		try {
			const createData: CreateArticleRequest = {
				title: addForm.title,
				content: addForm.content,
				active: addFormActiveStatus === 'true',
				published_at: addForm.published_at || undefined
			};

			await articleApi.createArticle(createData, selectedFile || undefined);
			successMessage = $t('common.article.messages.create_success');
			showAddDialog = false;

			// Clear form and draft after successful creation
			addForm = {
				title: '',
				content: '',
				active: true,
				published_at: ''
			};
			addFormActiveStatus = 'true';
			selectedFile = null;
			clearDraft(); // Clear the saved draft

			await loadArticles();
		} catch (err) {
			console.error('Error creating article:', err);
			errorMessage =
				err instanceof Error ? err.message : $t('common.article.messages.create_error');
		} finally {
			isCreating = false;
		}
	}

	function saveDraftAndClose() {
		saveDraft();
		showAddDialog = false;
	}

	function handleDialogClose() {
		if (addForm.title.trim() || addForm.content.trim()) {
			if (confirm('You have unsaved changes. Do you want to save as draft before closing?')) {
				saveDraft();
			}
		}
		showAddDialog = false;
	}

	// Warn user before leaving page with unsaved changes
	function handleBeforeUnload(event: BeforeUnloadEvent) {
		if (showAddDialog && (addForm.title.trim() || addForm.content.trim())) {
			saveDraft(); // Auto-save before page unload
			event.preventDefault();
			event.returnValue = '';
		}
	}

	async function handleRefresh() {
		await loadArticles();
	}

	function dismissMessage() {
		errorMessage = '';
		successMessage = '';
	}

	async function handlePageChange(page: number) {
		currentPage = page;
		await loadArticles();
	}

	function openAddDialog() {
		addForm = {
			title: '',
			content: '',
			active: true,
			published_at: ''
		};
		addFormActiveStatus = 'true';
		selectedFile = null;
		clearDraft(); // Clear any existing draft when starting fresh
		showAddDialog = true;
	}
</script>

<svelte:head>
	<title>Dashboard - {$t('common.article.title')}</title>
</svelte:head>

<div class="container mx-auto space-y-6 p-4">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">{$t('common.article.title')}</h1>
			<p class="text-muted-foreground">{$t('common.article.subtitle')}</p>
		</div>
		<div class="flex gap-2">
			{#if isDraft}
				<Tooltip.Root>
					<Tooltip.Trigger>
						<Button variant="secondary" size="sm" onclick={restoreDraft}>
							<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							Continue Draft
						</Button>
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>
							Continue writing your saved draft{lastSaved
								? ` (saved ${lastSaved.toLocaleTimeString()})`
								: ''}
						</p>
					</Tooltip.Content>
				</Tooltip.Root>
			{/if}
			<Tooltip.Root>
				<Tooltip.Trigger>
					<Button variant="outline" size="icon" onclick={handleRefresh} disabled={isLoading}>
						<RefreshCw class="h-4 w-4" />
					</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>{$t('common.article.refresh')}</p>
				</Tooltip.Content>
			</Tooltip.Root>
			<Tooltip.Root>
				<Tooltip.Trigger>
					<Button variant="default" size="icon" onclick={openAddDialog} disabled={isLoading}>
						<Plus class="h-4 w-4" />
					</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>{$t('common.article.add')}</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
	</div>

	{#if errorMessage}
		<Card.Root class="border-destructive bg-destructive/5">
			<Card.Content class="flex items-center justify-between pt-6">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-destructive/20 p-2">
						<svg
							class="h-4 w-4 text-destructive"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</div>
					<div>
						<h3 class="font-medium text-destructive">Error</h3>
						<p class="text-sm text-muted-foreground">{errorMessage}</p>
					</div>
				</div>
				<Button variant="ghost" size="sm" onclick={dismissMessage}>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</Button>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if successMessage}
		<Card.Root class="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
			<Card.Content class="flex items-center justify-between pt-6">
				<div class="flex items-center gap-3">
					<div class="rounded-full bg-green-100 p-2 dark:bg-green-900/50">
						<svg
							class="h-4 w-4 text-green-600 dark:text-green-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<div>
						<h3 class="font-medium text-green-800 dark:text-green-200">Success</h3>
						<p class="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
					</div>
				</div>
				<Button variant="ghost" size="sm" onclick={dismissMessage}>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</Button>
			</Card.Content>
		</Card.Root>
	{/if}

	<ArticleList
		{articles}
		{isLoading}
		onUpdate={handleUpdate}
		onDelete={handleDelete}
		onAdd={openAddDialog}
		{currentPage}
		{totalPages}
		{totalItems}
		{itemsPerPage}
		onPageChange={handlePageChange}
	/>
</div>

<!-- Add Article Dialog -->
<Dialog.Root bind:open={showAddDialog}>
	<Dialog.Content class="max-h-[85vh] max-w-3xl overflow-y-auto md:max-w-4xl lg:max-w-5xl">
		<Dialog.Header>
			<Dialog.Title>
				{$t('common.article.form.add_title')}
				{#if isDraft && lastSaved}
					<span class="ml-2 text-sm font-normal text-muted-foreground">
						(Draft saved at {lastSaved.toLocaleTimeString()})
					</span>
				{/if}
			</Dialog.Title>
			<Dialog.Description>
				{$t('common.article.form.add_description')}
				{#if isDraft}
					<span class="mt-1 block text-sm text-blue-600">
						📝 Your work is being auto-saved as you type
					</span>
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<form onsubmit={handleAdd} class="space-y-4">
			<div class="grid gap-4">
				<div>
					<Label for="add-title">{$t('common.article.form.title')} *</Label>
					<Input
						id="add-title"
						bind:value={addForm.title}
						placeholder={$t('common.article.form.title_placeholder')}
						required
					/>
				</div>

				<div>
					<Label for="add-active">{$t('common.article.form.status')}</Label>
					<div class="flex items-center space-x-2">
						<input
							id="add-active"
							type="checkbox"
							bind:checked={addForm.active}
							class="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
						/>
						<Label
							for="add-active"
							class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							{$t('common.status.active')}
						</Label>
					</div>
				</div>

				<div>
					<Label for="add-published"
						>{$t('common.article.form.published_date')}
						{$t('common.article.form.published_date_optional')}</Label
					>
					<Input
						id="add-published"
						type="datetime-local"
						bind:value={addForm.published_at}
						placeholder="YYYY-MM-DD HH:MM:SS"
					/>
					<p class="mt-1 text-xs text-muted-foreground">
						{$t('common.article.form.published_date_description')}
					</p>
				</div>

				<div>
					<Label for="add-cover">{$t('common.article.form.cover_image')}</Label>
					<Input id="add-cover" type="file" accept="image/*" onchange={handleFileChange} />
					{#if selectedFile}
						<p class="mt-1 text-sm text-muted-foreground">
							{$t('common.article.form.cover_selected')}
							{selectedFile.name}
						</p>
					{/if}
				</div>

				<div>
					<MarkdownEditor
						id="add-content"
						bind:value={addForm.content}
						placeholder={$t('common.article.form.content_placeholder')}
						label={$t('common.article.form.content')}
						rows={8}
						required={true}
					/>
				</div>
			</div>
		</form>
		<Dialog.Footer class="flex justify-between">
			<div class="flex gap-2">
				<Button variant="outline" onclick={saveDraftAndClose}>
					<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
						/>
					</svg>
					Save as Draft
				</Button>
				<Button variant="outline" onclick={handleDialogClose}>
					{$t('common.article.form.cancel')}
				</Button>
			</div>
			<Button onclick={handleAdd} disabled={isCreating}>
				{isCreating ? $t('common.article.form.creating') : $t('common.article.form.submit_create')}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
