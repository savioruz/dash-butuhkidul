<script lang="ts">
	import { browser } from '$app/environment';
	import { API_BASE_URL } from '$lib/types/api';
	import { onMount } from 'svelte';
	import { isAuthenticated, getAccessToken, getRefreshToken } from '$lib/auth';

	let debugInfo = $state({
		browser: false,
		apiBaseUrl: '',
		accessToken: '',
		refreshToken: '',
		isAuthenticated: false,
		protocol: '',
		hostname: ''
	});

	onMount(() => {
		debugInfo = {
			browser: browser,
			apiBaseUrl: API_BASE_URL,
			accessToken: getAccessToken() || 'none',
			refreshToken: getRefreshToken() || 'none',
			isAuthenticated: isAuthenticated(),
			protocol: browser ? window.location.protocol : 'SSR',
			hostname: browser ? window.location.hostname : 'SSR'
		};
	});

	function refreshTokens() {
		if (browser) {
			debugInfo.accessToken = getAccessToken() || 'none';
			debugInfo.refreshToken = getRefreshToken() || 'none';
			debugInfo.isAuthenticated = isAuthenticated();
		}
	}
</script>

<div class="p-8">
	<h1 class="mb-4 text-2xl font-bold">Debug Information</h1>

	<div class="space-y-2">
		<p><strong>Environment:</strong> {debugInfo.browser ? 'Browser' : 'Server'}</p>
		<p><strong>API Base URL:</strong> {debugInfo.apiBaseUrl}</p>
		<p><strong>Protocol:</strong> {debugInfo.protocol}</p>
		<p><strong>Hostname:</strong> {debugInfo.hostname}</p>
		<p><strong>Is Authenticated:</strong> {debugInfo.isAuthenticated ? 'Yes' : 'No'}</p>

		<div class="mt-4">
			<p><strong>Access Token:</strong></p>
			<pre class="rounded bg-gray-100 p-2 text-sm">{debugInfo.accessToken}</pre>
		</div>

		<div class="mt-4">
			<p><strong>Refresh Token:</strong></p>
			<pre class="rounded bg-gray-100 p-2 text-sm">{debugInfo.refreshToken}</pre>
		</div>

		<div class="mt-4">
			<button onclick={refreshTokens} class="rounded bg-blue-500 px-4 py-2 text-white">
				Refresh Token Info
			</button>
		</div>
	</div>
</div>
