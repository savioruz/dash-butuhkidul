<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { UserList } from '$lib/components/ui/user-list/index.js';
	import {
		UserForm,
		ChangePasswordForm,
		ChangeRoleForm
	} from '$lib/components/ui/user-form/index.js';
	import { Plus, Search, Filter, RefreshCw } from 'lucide-svelte';
	import { t } from '$lib/i18n';
	import { usersApi } from '$lib/api/users.js';
	import { requireSuperAdmin } from '$lib/utils/jwt.js';
	import type {
		User,
		CreateUserRequest,
		UpdateProfileRequest,
		UpdateRoleRequest,
		ChangePasswordRequest
	} from '$lib/types/user';

	// State
	let users = $state<User[]>([]);
	let isLoading = $state(true);
	let totalData = $state(0);
	let currentPage = $state(1);
	let itemsPerPage = $state(10);
	let errorMessage = $state('');
	let successMessage = $state('');

	function showError(message: string) {
		errorMessage = message;
		successMessage = '';
		setTimeout(() => {
			errorMessage = '';
		}, 5000);
	}

	function showSuccess(message: string) {
		successMessage = message;
		errorMessage = '';
		setTimeout(() => {
			successMessage = '';
		}, 3000);
	}

	// Form states
	let showCreateDialog = $state(false);
	let showEditDialog = $state(false);
	let showPasswordDialog = $state(false);
	let showRoleDialog = $state(false);
	let editingUser: User | null = $state(null);
	let isSubmitting = $state(false);

	// Filter states
	let searchEmail = $state('');
	let searchName = $state('');
	let filterLevel = $state('');
	let filterVerified = $state('');
	let filterActive = $state('');
	let showFilters = $state(false);

	onMount(async () => {
		// Check if user has super admin permission
		requireSuperAdmin('/dashboard');
		await loadUsers();
	});

	async function loadUsers() {
		try {
			isLoading = true;
			const params: Record<string, string | number | boolean> = {};

			if (searchEmail.trim()) params.email = searchEmail.trim();
			if (searchName.trim()) params.full_name = searchName.trim();
			if (filterLevel) params.level = filterLevel;
			if (filterVerified !== '') params.is_verified = filterVerified === 'true';
			if (filterActive !== '') params.active = filterActive === 'true';
			params.page = currentPage;
			params.limit = itemsPerPage;

			const response = await usersApi.getUsers(params);

			users = response.data?.users || [];
			totalData = response.data?.total_data || 0;
		} catch (error) {
			console.error('Error loading users:', error);
			showError(error instanceof Error ? error.message : $t('common.user.messages.load_error'));
			users = [];
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateUser(data: CreateUserRequest) {
		try {
			isSubmitting = true;

			await usersApi.createUser(data);
			showSuccess($t('common.user.messages.create_success'));
			showCreateDialog = false;
			await loadUsers();
		} catch (error) {
			console.error('Error creating user:', error);
			showError(error instanceof Error ? error.message : $t('common.user.messages.create_error'));
		} finally {
			isSubmitting = false;
		}
	}

	async function handleEditUser(data: UpdateProfileRequest) {
		if (!editingUser) return;

		try {
			isSubmitting = true;

			await usersApi.updateProfile(editingUser.id, data);
			showSuccess($t('common.user.messages.update_success'));
			showEditDialog = false;
			editingUser = null;
			await loadUsers();
		} catch (error) {
			console.error('Error updating user:', error);
			showError(error instanceof Error ? error.message : $t('common.user.messages.update_error'));
		} finally {
			isSubmitting = false;
		}
	}

	// Type-safe form submission handlers
	function handleCreateFormSubmit(data: CreateUserRequest | UpdateProfileRequest) {
		handleCreateUser(data as CreateUserRequest);
	}

	function handleEditFormSubmit(data: CreateUserRequest | UpdateProfileRequest) {
		handleEditUser(data as UpdateProfileRequest);
	}

	async function handleChangePassword(data: ChangePasswordRequest) {
		try {
			isSubmitting = true;

			await usersApi.changePassword(data);
			showSuccess($t('common.user.messages.password_change_success'));
			showPasswordDialog = false;
			editingUser = null;
		} catch (error) {
			console.error('Error changing password:', error);
			showError(
				error instanceof Error ? error.message : $t('common.user.messages.password_change_error')
			);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleChangeRole(data: UpdateRoleRequest) {
		if (!editingUser) return;

		try {
			isSubmitting = true;

			await usersApi.updateRole(editingUser.id, data);
			showSuccess($t('common.user.messages.update_success'));
			showRoleDialog = false;
			editingUser = null;
			await loadUsers();
		} catch (error) {
			console.error('Error updating role:', error);
			showError(error instanceof Error ? error.message : $t('common.user.messages.update_error'));
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteUser(userId: string) {
		if (!confirm('Are you sure you want to delete this user?')) return;

		try {
			await usersApi.deleteUser(userId);
			showSuccess($t('common.user.messages.delete_success'));
			await loadUsers();
		} catch (error) {
			console.error('Error deleting user:', error);
			showError(error instanceof Error ? error.message : $t('common.user.messages.delete_error'));
		}
	}

	function openCreateDialog() {
		showCreateDialog = true;
	}

	function openEditDialog(user: User) {
		editingUser = user;
		showEditDialog = true;
	}

	function openRoleDialog(user: User) {
		editingUser = user;
		showRoleDialog = true;
	}

	function clearFilters() {
		searchEmail = '';
		searchName = '';
		filterLevel = '';
		filterVerified = '';
		filterActive = '';
		loadUsers();
	}

	// Reactive search with debounce
	let debounceTimer: ReturnType<typeof setTimeout>;
	$effect(() => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			if (searchEmail || searchName || filterLevel || filterVerified || filterActive) {
				loadUsers();
			}
		}, 500);
	});

	const levelOptions = [
		{ value: '', label: 'All Levels' },
		{ value: '0', label: $t('common.user.levels.0') },
		{ value: '1', label: $t('common.user.levels.1') },
		{ value: '2', label: $t('common.user.levels.2') }
	];

	const verifiedOptions = [
		{ value: '', label: 'All' },
		{ value: 'true', label: $t('common.user.status.verified') },
		{ value: 'false', label: $t('common.user.status.unverified') }
	];

	const activeOptions = [
		{ value: '', label: 'All' },
		{ value: 'true', label: $t('common.status.active') },
		{ value: 'false', label: $t('common.status.inactive') }
	];
</script>

<svelte:head>
	<title>{$t('common.user.title')} | {$t('navigation.dashboard')}</title>
</svelte:head>

<div class="container mx-auto space-y-6 p-4">
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">{$t('common.user.title')}</h1>
			<p class="text-muted-foreground">{$t('common.user.subtitle')}</p>
		</div>
		<div class="flex gap-2">
			<Button onclick={() => (showFilters = !showFilters)} variant="outline" size="sm">
				<Filter class="mr-2 h-4 w-4" />
				Filters
			</Button>
			<Button onclick={loadUsers} variant="outline" size="sm">
				<RefreshCw class="mr-2 h-4 w-4" />
				Refresh
			</Button>
			<Button onclick={openCreateDialog}>
				<Plus class="mr-2 h-4 w-4" />
				{$t('common.user.add')}
			</Button>
		</div>
	</div>

	<!-- Error/Success Messages -->
	{#if errorMessage}
		<div class="rounded-md bg-red-50 p-4">
			<div class="flex">
				<div class="ml-3">
					<h3 class="text-sm font-medium text-red-800">Error</h3>
					<div class="mt-2 text-sm text-red-700">
						<p>{errorMessage}</p>
					</div>
				</div>
			</div>
		</div>
	{/if}

	{#if successMessage}
		<div class="rounded-md bg-green-50 p-4">
			<div class="flex">
				<div class="ml-3">
					<h3 class="text-sm font-medium text-green-800">Success</h3>
					<div class="mt-2 text-sm text-green-700">
						<p>{successMessage}</p>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Filters -->
	{#if showFilters}
		<Card>
			<CardHeader>
				<CardTitle class="text-lg">Search & Filter</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
					<div class="space-y-2">
						<label for="search-email" class="text-sm font-medium">Email</label>
						<div class="relative">
							<Search class="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
							<Input
								id="search-email"
								bind:value={searchEmail}
								placeholder="Search by email..."
								class="pl-8"
							/>
						</div>
					</div>
					<div class="space-y-2">
						<label for="search-name" class="text-sm font-medium">Name</label>
						<div class="relative">
							<Search class="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
							<Input
								id="search-name"
								bind:value={searchName}
								placeholder="Search by name..."
								class="pl-8"
							/>
						</div>
					</div>
					<div class="space-y-2">
						<label for="filter-level" class="text-sm font-medium">Level</label>
						<Select.Root type="single" bind:value={filterLevel}>
							<Select.Trigger>
								{levelOptions.find((opt) => opt.value === filterLevel)?.label || 'All Levels'}
							</Select.Trigger>
							<Select.Content>
								{#each levelOptions as option (option.value)}
									<Select.Item value={option.value}>{option.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
					<div class="space-y-2">
						<label for="filter-verified" class="text-sm font-medium">Verification</label>
						<Select.Root type="single" bind:value={filterVerified}>
							<Select.Trigger>
								{verifiedOptions.find((opt) => opt.value === filterVerified)?.label || 'All'}
							</Select.Trigger>
							<Select.Content>
								{#each verifiedOptions as option (option.value)}
									<Select.Item value={option.value}>{option.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
					<div class="space-y-2">
						<label for="filter-active" class="text-sm font-medium">Status</label>
						<Select.Root type="single" bind:value={filterActive}>
							<Select.Trigger>
								{activeOptions.find((opt) => opt.value === filterActive)?.label || 'All'}
							</Select.Trigger>
							<Select.Content>
								{#each activeOptions as option (option.value)}
									<Select.Item value={option.value}>{option.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</div>
				<div class="mt-4 flex gap-2">
					<Button onclick={loadUsers} size="sm">Apply Filters</Button>
					<Button onclick={clearFilters} variant="outline" size="sm">Clear All</Button>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Users List -->
	<Card>
		<CardHeader>
			<CardTitle>Users</CardTitle>
			<CardDescription>
				Showing {users.length} of {totalData} users
			</CardDescription>
		</CardHeader>
		<CardContent>
			<UserList
				{users}
				{isLoading}
				onAdd={openCreateDialog}
				onEdit={openEditDialog}
				onDelete={handleDeleteUser}
				onChangeRole={openRoleDialog}
			/>
		</CardContent>
	</Card>
</div>

<!-- Create User Dialog -->
<UserForm
	bind:isOpen={showCreateDialog}
	mode="create"
	{isSubmitting}
	onClose={() => (showCreateDialog = false)}
	onSubmit={handleCreateFormSubmit}
/>

<!-- Edit User Dialog -->
<UserForm
	bind:isOpen={showEditDialog}
	mode="edit"
	user={editingUser}
	{isSubmitting}
	onClose={() => {
		showEditDialog = false;
		editingUser = null;
	}}
	onSubmit={handleEditFormSubmit}
/>

<!-- Change Password Dialog -->
<ChangePasswordForm
	bind:isOpen={showPasswordDialog}
	user={editingUser}
	{isSubmitting}
	onClose={() => {
		showPasswordDialog = false;
		editingUser = null;
	}}
	onSubmit={handleChangePassword}
/>

<!-- Change Role Dialog -->
<ChangeRoleForm
	bind:isOpen={showRoleDialog}
	user={editingUser}
	{isSubmitting}
	onClose={() => {
		showRoleDialog = false;
		editingUser = null;
	}}
	onSubmit={handleChangeRole}
/>
