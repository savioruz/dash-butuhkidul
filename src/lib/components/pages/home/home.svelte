<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { t } from '$lib/i18n';
	import { authApi } from '$lib/api/auth.js';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');

	const id = crypto.randomUUID();

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!email || !password) {
			errorMessage = 'Email and password are required';
			return;
		}

		isLoading = true;
		errorMessage = '';

		try {
			const response = await authApi.login({ email, password });

			console.log('Login response:', response); // Debug log

			if (browser) {
				const secureFlag = window.location.protocol === 'https:' ? 'Secure; ' : '';

				// Set cookies with more explicit settings
				const accessTokenCookie = `accessToken=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; ${secureFlag}`;
				const refreshTokenCookie = response.refresh_token
					? `refreshToken=${response.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax; ${secureFlag}`
					: '';

				document.cookie = accessTokenCookie;
				if (refreshTokenCookie) {
					document.cookie = refreshTokenCookie;
				}

				console.log('Cookies set:', {
					accessToken: accessTokenCookie,
					refreshToken: refreshTokenCookie,
					currentCookies: document.cookie
				});

				// Verify cookies were set
				setTimeout(() => {
					const cookieCheck = document.cookie;
					console.log('Cookie verification:', {
						allCookies: cookieCheck,
						hasAccessToken: cookieCheck.includes('accessToken=')
					});

					// Try multiple redirect methods for better compatibility
					try {
						// Method 1: Use SvelteKit goto first
						goto('/dashboard');
					} catch (gotoError) {
						console.log('goto failed, trying window.location:', gotoError);
						// Method 2: Fallback to window.location
						window.location.href = '/dashboard';
					}
				}, 100);
			} else {
				await goto('/dashboard');
			}
		} catch (error) {
			console.error('Login error:', error);
			errorMessage = 'Login failed. Please check your credentials.';
			isLoading = false;
		}
	}
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">{$t('common.auth.login.title')}</Card.Title>
		<Card.Description>{$t('common.auth.login.description')}</Card.Description>
	</Card.Header>
	<Card.Content>
		<form onsubmit={handleSubmit} class="grid gap-4">
			{#if errorMessage}
				<div class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
					{errorMessage}
				</div>
			{/if}

			<div class="grid gap-2">
				<Label for="email-{id}">{$t('common.auth.login.email')}</Label>
				<Input
					id="email-{id}"
					type="email"
					placeholder={$t('common.auth.login.email_placeholder')}
					bind:value={email}
					required
					disabled={isLoading}
				/>
			</div>

			<div class="grid gap-2">
				<div class="flex items-center">
					<Label for="password-{id}">{$t('common.auth.login.password')}</Label>
				</div>
				<Input
					id="password-{id}"
					type="password"
					bind:value={password}
					required
					disabled={isLoading}
				/>
			</div>

			<Button type="submit" class="w-full" disabled={isLoading}>
				{#if isLoading}
					<svg
						class="mr-3 -ml-1 h-4 w-4 animate-spin text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					{$t('common.auth.login.signing_in')}
				{:else}
					{$t('common.auth.login.submit')}
				{/if}
			</Button>
		</form>
	</Card.Content>
</Card.Root>
