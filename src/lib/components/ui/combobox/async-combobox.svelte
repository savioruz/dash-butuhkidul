<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick, onDestroy } from 'svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { cn } from '$lib/utils';

	type Option = {
		label: string;
		value: string;
	};

	const {
		fetchOptions,
		placeholder = 'Select an option...',
		searchPlaceholder = 'Search...',
		emptyText = 'No results found.',
		loadingText = 'Loading...',
		buttonClass = '',
		onSelect = () => {},
		required = false,
		showError = false,
		value = $bindable(''),
		debounceMs = 300
	}: {
		fetchOptions: (query: string) => Promise<Option[]>;
		placeholder?: string;
		searchPlaceholder?: string;
		emptyText?: string;
		loadingText?: string;
		buttonClass?: string;
		onSelect?: (value: string) => void;
		required?: boolean;
		showError?: boolean;
		value?: string;
		debounceMs?: number;
	} = $props();

	let open = $state(false);
	let searchTerm = $state('');
	let options = $state<Option[]>([]);
	let isLoading = $state(false);
	let triggerRef: HTMLButtonElement | null = $state(null);
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	let selectedOption = $derived(value);
	let selectedLabel = $derived(options.find((o) => o.value === selectedOption)?.label || '');

	// Load initial options when opened
	$effect(() => {
		if (open && options.length === 0 && !isLoading) {
			loadOptions('');
		}
	});

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef?.focus();
		});
	}

	function handleSelect(optionValue: string) {
		onSelect?.(optionValue);
		closeAndFocusTrigger();
	}

	async function loadOptions(query: string) {
		isLoading = true;
		try {
			const result = await fetchOptions(query);
			options = result;
		} catch (error) {
			console.error('Error loading options:', error);
			options = [];
		} finally {
			isLoading = false;
		}
	}

	// Debounced search function
	function handleSearch(term: string) {
		searchTerm = term;
		// Clear previous timeout
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}
		// Debounce search
		searchTimeout = setTimeout(() => {
			loadOptions(term);
		}, debounceMs);
	}

	onDestroy(() => {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}
	});
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				bind:ref={triggerRef}
				variant="outline"
				class={cn('justify-between', buttonClass, {
					'text-muted-foreground': !selectedLabel,
					'border-destructive': showError
				})}
				{...props}
				role="combobox"
				aria-label={placeholder}
				aria-expanded={open}
				aria-required={required}
			>
				{#if selectedLabel}
					{#if selectedLabel.length > 22}
						{selectedLabel.slice(0, 22)}...
					{:else}
						{selectedLabel}
					{/if}
				{:else}
					{placeholder}
				{/if}
				<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.PopoverContent class="w-[--bits-popover-trigger-width] p-0">
		<div class="flex flex-col">
			<!-- Search Input -->
			<div class="border-b p-2">
				<Input
					type="text"
					placeholder={searchPlaceholder}
					bind:value={searchTerm}
					oninput={(e) => handleSearch(e.currentTarget.value)}
					class="h-8"
				/>
			</div>

			<!-- Options List -->
			<div class="max-h-[300px] overflow-y-auto p-1">
				{#if isLoading}
					<div class="py-6 text-center text-sm text-muted-foreground">
						{loadingText}
					</div>
				{:else if options.length === 0}
					<div class="py-6 text-center text-sm text-muted-foreground">
						{emptyText}
					</div>
				{:else}
					{#each options as option (option.value)}
						<button
							type="button"
							class={cn(
								'relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none',
								'hover:bg-accent hover:text-accent-foreground',
								'focus:bg-accent focus:text-accent-foreground',
								selectedOption === option.value && 'bg-accent'
							)}
							onclick={() => handleSelect(option.value)}
						>
							<Check
								class={cn(
									'mr-2 h-4 w-4',
									selectedOption === option.value ? 'opacity-100' : 'opacity-0'
								)}
							/>
							{option.label}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</Popover.PopoverContent>
</Popover.Root>
