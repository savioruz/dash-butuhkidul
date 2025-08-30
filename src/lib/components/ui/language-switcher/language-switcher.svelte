<script lang="ts">
	import { locale, loadTranslations } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import lang from '$lang/lang.json';
	import * as Select from '$lib/components/ui/select/index.js';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Globe } from 'lucide-svelte';

	let mounted = $state(false);
	let currentLocale = $state('en');

	onMount(() => {
		try {
			currentLocale = $locale || 'en';
		} catch (error) {
			console.warn('Language switcher initialization warning:', error);
			currentLocale = 'en';
		}
		mounted = true;
	});

	async function switchLanguage(newLocale: string) {
		if (!browser || !mounted) return;

		try {
			await loadTranslations(newLocale, 'common');
			await loadTranslations(newLocale, 'navigation');

			locale.set(newLocale);
			currentLocale = newLocale;

			const url = new URL(page.url);
			url.searchParams.set('lang', newLocale);
			goto(url.toString());
		} catch (error) {
			console.error('Error switching language:', error);
		}
	}
</script>

{#if mounted}
	<Select.Root type="single" bind:value={currentLocale} onValueChange={switchLanguage}>
		<Select.Trigger class="relative">
			<Globe />
		</Select.Trigger>
		<Select.Content>
			{#each Object.entries(lang) as [code, name] (code)}
				<Select.Item value={code}>
					{name}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
{:else}
	<div class="px-3 py-2 text-sm">
		<Globe />
	</div>
{/if}
