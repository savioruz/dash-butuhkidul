<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card/index.js';
	import { Eye, EyeOff, Key } from 'lucide-svelte';
	import { t } from '$lib/i18n';
	import { usersApi } from '$lib/api/users.js';
	import { requireAuth, getUserInfo } from '$lib/utils/jwt.js';
	import type { ChangePasswordRequest } from '$lib/types/user';

	// State
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let isSubmitting = $state(false);
	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	// User info
	let userInfo = $state<{ id: string; email: string; level: number; full_name?: string } | null>(
		null
	);

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

	onMount(() => {
		// Check authentication
		requireAuth();
		userInfo = getUserInfo();
	});

	async function handleChangePassword() {
		// Reset messages
		errorMessage = '';
		successMessage = '';

		// Validation
		if (!currentPassword.trim()) {
			showError('Current password is required');
			return;
		}

		if (!newPassword.trim()) {
			showError('New password is required');
			return;
		}

		if (newPassword.length < 6) {
			showError('New password must be at least 6 characters');
			return;
		}

		if (newPassword !== confirmPassword) {
			showError('New password and confirmation do not match');
			return;
		}

		if (currentPassword === newPassword) {
			showError('New password must be different from current password');
			return;
		}

		try {
			isSubmitting = true;

			const data: ChangePasswordRequest = {
				current_password: currentPassword,
				new_password: newPassword
			};

			await usersApi.changePassword(data);
			showSuccess('Password changed successfully');

			// Clear form
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} catch (error) {
			console.error('Error changing password:', error);
			showError(error instanceof Error ? error.message : 'Failed to change password');
		} finally {
			isSubmitting = false;
		}
	}

	function toggleCurrentPasswordVisibility() {
		showCurrentPassword = !showCurrentPassword;
	}

	function toggleNewPasswordVisibility() {
		showNewPassword = !showNewPassword;
	}

	function toggleConfirmPasswordVisibility() {
		showConfirmPassword = !showConfirmPassword;
	}
</script>

<svelte:head>
	<title>Change Password | {$t('navigation.dashboard')}</title>
</svelte:head>

<div class="container mx-auto max-w-2xl space-y-6 p-4">
	<!-- Header -->
	<div class="space-y-2">
		<h1 class="text-2xl font-bold tracking-tight">Change Password</h1>
		<p class="text-muted-foreground">Update your account password for better security</p>
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

	<!-- User Info Card -->
	{#if userInfo}
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Key class="h-5 w-5" />
					Account Information
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-2 text-sm">
					<div>
						<span class="font-medium">Email:</span>
						{userInfo.email}
					</div>
					{#if userInfo.full_name}
						<div>
							<span class="font-medium">Name:</span>
							{userInfo.full_name}
						</div>
					{/if}
					<div>
						<span class="font-medium">Role:</span>
						{#if userInfo.level === 0}
							Super Admin
						{:else if userInfo.level === 1}
							Admin
						{:else}
							User
						{/if}
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Change Password Form -->
	<Card>
		<CardHeader>
			<CardTitle>Change Password</CardTitle>
			<CardDescription>
				Please enter your current password and choose a new secure password.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleChangePassword();
				}}
				class="space-y-4"
			>
				<!-- Current Password -->
				<div class="space-y-2">
					<Label for="current-password">Current Password *</Label>
					<div class="relative">
						<Input
							id="current-password"
							type={showCurrentPassword ? 'text' : 'password'}
							bind:value={currentPassword}
							placeholder="Enter your current password"
							disabled={isSubmitting}
							required
						/>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							class="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
							onclick={toggleCurrentPasswordVisibility}
						>
							{#if showCurrentPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</Button>
					</div>
				</div>

				<!-- New Password -->
				<div class="space-y-2">
					<Label for="new-password">New Password *</Label>
					<div class="relative">
						<Input
							id="new-password"
							type={showNewPassword ? 'text' : 'password'}
							bind:value={newPassword}
							placeholder="Enter your new password (min. 6 characters)"
							disabled={isSubmitting}
							required
						/>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							class="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
							onclick={toggleNewPasswordVisibility}
						>
							{#if showNewPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</Button>
					</div>
				</div>

				<!-- Confirm Password -->
				<div class="space-y-2">
					<Label for="confirm-password">Confirm New Password *</Label>
					<div class="relative">
						<Input
							id="confirm-password"
							type={showConfirmPassword ? 'text' : 'password'}
							bind:value={confirmPassword}
							placeholder="Confirm your new password"
							disabled={isSubmitting}
							required
						/>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							class="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
							onclick={toggleConfirmPasswordVisibility}
						>
							{#if showConfirmPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</Button>
					</div>
				</div>

				<!-- Password Requirements -->
				<div class="rounded-md bg-blue-50 p-3">
					<h4 class="text-sm font-medium text-blue-800">Password Requirements:</h4>
					<ul class="mt-1 text-xs text-blue-700">
						<li>• At least 6 characters long</li>
						<li>• Must be different from your current password</li>
						<li>• Use a combination of letters, numbers, and symbols for better security</li>
					</ul>
				</div>

				<!-- Submit Button -->
				<div class="flex justify-end">
					<Button type="submit" disabled={isSubmitting}>
						{#if isSubmitting}
							Changing Password...
						{:else}
							Change Password
						{/if}
					</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
