<script lang="ts">
	import { browser } from '$app/environment';
	import { API_BASE_URL } from '$lib/types/api';
	import { onMount } from 'svelte';

	let debugInfo = $state({
		browser: false,
		apiBaseUrl: '',
		cookies: '',
		protocol: '',
		hostname: ''
	});

	onMount(() => {
		debugInfo = {
			browser: browser,
			apiBaseUrl: API_BASE_URL,
			cookies: browser ? document.cookie : 'SSR',
			protocol: browser ? window.location.protocol : 'SSR',
			hostname: browser ? window.location.hostname : 'SSR'
		};
	});
</script>

<div class="p-8">
	<h1 class="mb-4 text-2xl font-bold">Debug Information</h1>

	<div class="space-y-2">
		<p><strong>Environment:</strong> {debugInfo.browser ? 'Browser' : 'Server'}</p>
		<p><strong>API Base URL:</strong> {debugInfo.apiBaseUrl}</p>
		<p><strong>Protocol:</strong> {debugInfo.protocol}</p>
		<p><strong>Hostname:</strong> {debugInfo.hostname}</p>
		<p><strong>All Cookies:</strong></p>
		<pre class="rounded bg-gray-100 p-2 text-sm">{debugInfo.cookies || 'No cookies'}</pre>

		<div class="mt-4">
			<button
				onclick={() => {
					if (browser) {
						debugInfo.cookies = document.cookie;
					}
				}}
				class="rounded bg-blue-500 px-4 py-2 text-white"
			>
				Refresh Cookies
			</button>
		</div>
	</div>
</div>
