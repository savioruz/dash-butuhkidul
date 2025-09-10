<script lang="ts">
	import { onMount } from 'svelte';
	import { dashboardApi, type DashboardSummary, type PopulationData } from '$lib/api/dashboard';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		TrendingUp,
		TrendingDown,
		Users,
		Building,
		RefreshCw,
		DollarSign,
		PieChart
	} from 'lucide-svelte';
	import { t } from '$lib/i18n';

	let summary = $state<DashboardSummary>({ total_income: 0, total_expense: 0 });
	let population = $state<PopulationData[]>([]);
	let isLoading = $state(true);
	let errorMessage = $state('');

	onMount(async () => {
		await loadDashboardData();
	});

	async function loadDashboardData() {
		try {
			isLoading = true;
			errorMessage = '';

			// Load only population and finance data
			const [summaryResult, populationResult] = await Promise.allSettled([
				dashboardApi.getTransactionSummary(),
				dashboardApi.getPopulation()
			]);

			// Handle transaction summary
			if (summaryResult.status === 'fulfilled') {
				const summaryData = summaryResult.value;
				summary = summaryData?.data || summaryData || { total_income: 0, total_expense: 0 };
			} else {
				summary = { total_income: 0, total_expense: 0 };
			}

			// Handle population data
			if (populationResult.status === 'fulfilled') {
				const populationData = populationResult.value;
				population = populationData?.data?.population || [];
			} else {
				population = [];
			}
		} catch {
			errorMessage = $t('common.dashboard.error.load_failed');
		} finally {
			isLoading = false;
		}
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('id-ID').format(num);
	}

	function getTotalPopulation(): number {
		return population.reduce((sum, p) => sum + p.total_population, 0);
	}

	function getTotalHouseholds(): number {
		return population.reduce((sum, p) => sum + p.households, 0);
	}

	function getBalance(): number {
		return summary.total_income - summary.total_expense;
	}

	function getBalanceColor(): string {
		const balance = getBalance();
		if (balance > 0) return 'text-green-600';
		if (balance < 0) return 'text-red-600';
		return 'text-gray-600';
	}
</script>

<svelte:head>
	<title>Dashboard - {$t('navigation.sidebar.dashboard')}</title>
</svelte:head>

<div class="container mx-auto space-y-6 p-4">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">{$t('common.dashboard.title')}</h1>
			<p class="text-muted-foreground">{$t('common.dashboard.subtitle')}</p>
		</div>
		<Button variant="outline" size="icon" onclick={loadDashboardData} disabled={isLoading}>
			<RefreshCw class="h-4 w-4 {isLoading ? 'animate-spin' : ''}" />
		</Button>
	</div>

	<!-- Error Message -->
	{#if errorMessage}
		<Card.Root class="border-destructive bg-destructive/5">
			<Card.Content class="pt-6">
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
						<h3 class="font-medium text-destructive">{$t('common.error')}</h3>
						<p class="text-sm text-muted-foreground">{errorMessage}</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Loading State -->
	{#if isLoading}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{#each Array(4) as i, index (index)}
				{void i}
				<Card.Root>
					<Card.Content class="p-6">
						<div class="animate-pulse">
							<div class="mb-4 h-4 w-3/4 rounded bg-gray-300"></div>
							<div class="h-8 w-1/2 rounded bg-gray-300"></div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
		<!-- Population Charts Loading -->
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{#each Array(4) as i, index (index)}
				{void i}
				<Card.Root>
					<Card.Content class="p-6">
						<div class="animate-pulse">
							<div class="mb-4 h-4 w-3/4 rounded bg-gray-300"></div>
							<div class="h-8 w-1/2 rounded bg-gray-300"></div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:else}
		<!-- Financial Summary -->
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card.Root>
				<Card.Content class="p-6">
					<div class="flex items-center space-x-2">
						<TrendingUp class="h-4 w-4 text-green-600" />
						<p class="text-sm font-medium text-muted-foreground">
							{$t('common.dashboard.finance.total_income')}
						</p>
					</div>
					<p class="text-2xl font-bold text-green-600">{formatCurrency(summary.total_income)}</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="p-6">
					<div class="flex items-center space-x-2">
						<TrendingDown class="h-4 w-4 text-red-600" />
						<p class="text-sm font-medium text-muted-foreground">
							{$t('common.dashboard.finance.total_expense')}
						</p>
					</div>
					<p class="text-2xl font-bold text-red-600">{formatCurrency(summary.total_expense)}</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="p-6">
					<div class="flex items-center space-x-2">
						<DollarSign class="h-4 w-4 {getBalanceColor()}" />
						<p class="text-sm font-medium text-muted-foreground">
							{$t('common.dashboard.finance.balance')}
						</p>
					</div>
					<p class="text-2xl font-bold {getBalanceColor()}">{formatCurrency(getBalance())}</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="p-6">
					<div class="flex items-center space-x-2">
						<PieChart class="h-4 w-4 text-blue-600" />
						<p class="text-sm font-medium text-muted-foreground">
							{$t('common.dashboard.finance.expense_ratio')}
						</p>
					</div>
					<p class="text-2xl font-bold text-blue-600">
						{summary.total_income > 0
							? Math.round((summary.total_expense / summary.total_income) * 100)
							: 0}%
					</p>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Population Statistics -->
		{#if population.length > 0}
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card.Root>
					<Card.Content class="p-6">
						<div class="flex items-center space-x-2">
							<Users class="h-4 w-4 text-indigo-600" />
							<p class="text-sm font-medium text-muted-foreground">
								{$t('common.dashboard.population.total_population')}
							</p>
						</div>
						<p class="text-2xl font-bold">{formatNumber(getTotalPopulation())}</p>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content class="p-6">
						<div class="flex items-center space-x-2">
							<Building class="h-4 w-4 text-amber-600" />
							<p class="text-sm font-medium text-muted-foreground">
								{$t('common.dashboard.population.total_households')}
							</p>
						</div>
						<p class="text-2xl font-bold">{formatNumber(getTotalHouseholds())}</p>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content class="p-6">
						<div class="flex items-center space-x-2">
							<Users class="h-4 w-4 text-pink-600" />
							<p class="text-sm font-medium text-muted-foreground">
								{$t('common.dashboard.population.hamlets')}
							</p>
						</div>
						<p class="text-2xl font-bold">{population.length}</p>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content class="p-6">
						<div class="flex items-center space-x-2">
							<Users class="h-4 w-4 text-emerald-600" />
							<p class="text-sm font-medium text-muted-foreground">
								{$t('common.dashboard.population.avg_household_size')}
							</p>
						</div>
						<p class="text-2xl font-bold">
							{getTotalHouseholds() > 0
								? Math.round((getTotalPopulation() / getTotalHouseholds()) * 10) / 10
								: 0}
						</p>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Population Charts -->
			<div class="grid gap-6 md:grid-cols-2">
				<!-- Population by Hamlet Bar Chart -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{$t('common.dashboard.charts.population_by_hamlet.title')}</Card.Title>
						<Card.Description
							>{$t('common.dashboard.charts.population_by_hamlet.description')}</Card.Description
						>
					</Card.Header>
					<Card.Content class="pb-6">
						<div class="relative flex h-[280px] flex-col">
							{#if population.length > 0}
								{@const maxPopulation = Math.max(...population.map((p) => p.total_population))}
								<div class="flex flex-1 items-end justify-center gap-6 pb-8">
									{#each population as item (item.hamlet)}
										{@const barHeight = (item.total_population / maxPopulation) * 180}
										<div class="group relative flex flex-col items-center gap-2">
											<span
												class="text-sm font-medium text-gray-700 transition-all group-hover:text-blue-600"
											>
												{formatNumber(item.total_population)}
											</span>
											<div
												class="flex w-12 cursor-pointer items-end justify-center rounded-t bg-blue-500 transition-all duration-300 hover:scale-110 hover:bg-blue-600 hover:shadow-lg"
												style="height: {barHeight}px"
												title="{item.hamlet}: {formatNumber(
													item.total_population
												)} people, {formatNumber(item.households)} households"
											>
												<div
													class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded-lg bg-black px-3 py-2 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
												>
													<div class="font-semibold">{item.hamlet}</div>
													<div>
														{$t('common.dashboard.charts.population_label')}: {formatNumber(
															item.total_population
														)}
													</div>
													<div>
														{$t('common.dashboard.charts.households_label')}: {formatNumber(
															item.households
														)}
													</div>
													<div
														class="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-black"
													></div>
												</div>
											</div>
											<span
												class="text-sm text-gray-600 transition-all group-hover:font-medium group-hover:text-blue-600"
											>
												{item.hamlet}
											</span>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Gender Distribution Pie Chart -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{$t('common.dashboard.charts.gender_distribution.title')}</Card.Title>
						<Card.Description
							>{$t('common.dashboard.charts.gender_distribution.description')}</Card.Description
						>
					</Card.Header>
					<Card.Content class="pb-6">
						<div class="flex h-[280px] items-center">
							{#if population.length > 0}
								{@const totalMale = population.reduce((sum, p) => sum + p.male, 0)}
								{@const totalFemale = population.reduce((sum, p) => sum + p.female, 0)}
								{@const total = totalMale + totalFemale}
								{@const malePercentage = (totalMale / total) * 100}
								{@const femalePercentage = (totalFemale / total) * 100}

								<div class="flex w-full items-center gap-6">
									<div class="flex flex-1 justify-center">
										<div class="group relative">
											<svg width="160" height="160" viewBox="0 0 160 160" class="cursor-pointer">
												<circle
													cx="80"
													cy="80"
													r="60"
													fill="none"
													stroke="#e5e7eb"
													stroke-width="20"
												/>
												<circle
													cx="80"
													cy="80"
													r="60"
													fill="none"
													stroke="#3B82F6"
													stroke-width="20"
													stroke-dasharray="{(malePercentage / 100) * 377} 377"
													stroke-dashoffset="0"
													transform="rotate(-90 80 80)"
													class="transition-all duration-300 hover:stroke-[#2563EB] hover:drop-shadow-lg"
												/>
												<circle
													cx="80"
													cy="80"
													r="60"
													fill="none"
													stroke="#F97316"
													stroke-width="20"
													stroke-dasharray="{(femalePercentage / 100) * 377} 377"
													stroke-dashoffset="-{(malePercentage / 100) * 377}"
													transform="rotate(-90 80 80)"
													class="transition-all duration-300 hover:stroke-[#EA580C] hover:drop-shadow-lg"
												/>
												<text
													x="80"
													y="75"
													text-anchor="middle"
													class="fill-gray-700 text-lg font-bold"
												>
													{formatNumber(total)}
												</text>
												<text x="80" y="90" text-anchor="middle" class="fill-gray-500 text-xs">
													{$t('common.dashboard.charts.total_label')}
												</text>
											</svg>
										</div>
									</div>

									<div class="space-y-3">
										<div
											class="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
										>
											<div
												class="h-4 w-4 rounded-full transition-transform group-hover:scale-110"
												style="background-color: #3B82F6"
											></div>
											<div>
												<div
													class="text-sm font-medium transition-colors group-hover:text-blue-600"
												>
													{$t('common.dashboard.charts.male_label')}: {formatNumber(totalMale)}
												</div>
												<div
													class="text-xs text-gray-500 transition-colors group-hover:text-blue-500"
												>
													{malePercentage.toFixed(1)}%
												</div>
											</div>
										</div>
										<div
											class="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
										>
											<div
												class="h-4 w-4 rounded-full transition-transform group-hover:scale-110"
												style="background-color: #F97316"
											></div>
											<div>
												<div
													class="text-sm font-medium transition-colors group-hover:text-blue-600"
												>
													{$t('common.dashboard.charts.female_label')}: {formatNumber(totalFemale)}
												</div>
												<div
													class="text-xs text-gray-500 transition-colors group-hover:text-blue-500"
												>
													{femalePercentage.toFixed(1)}%
												</div>
											</div>
										</div>
									</div>
								</div>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Age Distribution Bar Chart -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{$t('common.dashboard.charts.age_distribution.title')}</Card.Title>
						<Card.Description
							>{$t('common.dashboard.charts.age_distribution.description')}</Card.Description
						>
					</Card.Header>
					<Card.Content class="pb-6">
						<div class="h-[280px]">
							{#if population.length > 0}
								{@const totalChildren = population.reduce((sum, p) => sum + p.children, 0)}
								{@const totalAdults = population.reduce(
									(sum, p) => sum + Math.max(0, p.total_population - p.children - p.elderly),
									0
								)}
								{@const totalElderly = population.reduce((sum, p) => sum + p.elderly, 0)}
								{@const ageData = [
									{
										ageGroup: $t('common.dashboard.charts.age_groups.children'),
										count: totalChildren,
										color: '#3B82F6'
									},
									{
										ageGroup: $t('common.dashboard.charts.age_groups.adults'),
										count: totalAdults,
										color: '#10B981'
									},
									{
										ageGroup: $t('common.dashboard.charts.age_groups.elderly'),
										count: totalElderly,
										color: '#F59E0B'
									}
								]}
								{@const maxValue = Math.max(...ageData.map((d) => d.count))}

								<div class="space-y-4 pt-4">
									{#each ageData as item (item.ageGroup)}
										{@const percentage = maxValue > 0 ? (item.count / maxValue) * 100 : 0}
										<div class="group space-y-2">
											<div class="flex items-center justify-between">
												<span
													class="text-sm font-medium transition-colors group-hover:text-blue-600"
												>
													{item.ageGroup}
												</span>
												<span
													class="text-sm text-gray-600 transition-colors group-hover:font-medium group-hover:text-blue-600"
												>
													{formatNumber(item.count)}
												</span>
											</div>
											<div
												class="relative h-6 w-full cursor-pointer overflow-hidden rounded-full bg-gray-200"
											>
												<div
													class="relative h-6 rounded-full transition-all duration-500 hover:scale-y-110 hover:shadow-md"
													style="width: {percentage}%; background-color: {item.color}"
													title="{item.ageGroup}: {formatNumber(item.count)} people"
												>
													<div
														class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded-lg bg-black px-3 py-2 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
													>
														<div class="font-semibold">{item.ageGroup}</div>
														<div>
															{$t('common.dashboard.charts.population_label')}: {formatNumber(
																item.count
															)}
														</div>
														<div
															class="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-black"
														></div>
													</div>
												</div>
											</div>
										</div>
									{/each}

									<div class="grid grid-cols-3 gap-2 pt-4">
										{#each ageData as item (item.ageGroup)}
											<div class="flex items-center gap-2">
												<div class="h-3 w-3 rounded" style="background-color: {item.color}"></div>
												<span class="text-xs">{item.ageGroup}</span>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Household Distribution -->
				<Card.Root>
					<Card.Header>
						<Card.Title>{$t('common.dashboard.charts.household_distribution.title')}</Card.Title>
						<Card.Description
							>{$t('common.dashboard.charts.household_distribution.description')}</Card.Description
						>
					</Card.Header>
					<Card.Content class="pb-6">
						<div class="h-[280px]">
							{#if population.length > 0}
								{@const maxHouseholds = Math.max(...population.map((p) => p.households))}
								<div class="space-y-4 pt-4">
									{#each population as item (item.hamlet)}
										{@const percentage =
											maxHouseholds > 0 ? (item.households / maxHouseholds) * 100 : 0}
										<div class="group space-y-2">
											<div class="flex items-center justify-between">
												<span
													class="text-sm font-medium transition-colors group-hover:text-blue-600"
												>
													{item.hamlet}
												</span>
												<span
													class="text-sm text-gray-600 transition-colors group-hover:font-medium group-hover:text-blue-600"
												>
													{formatNumber(item.households)}
												</span>
											</div>
											<div
												class="relative h-6 w-full cursor-pointer overflow-hidden rounded-full bg-gray-200"
											>
												<div
													class="relative h-6 rounded-full bg-emerald-500 transition-all duration-500 hover:scale-y-110 hover:bg-emerald-600 hover:shadow-md"
													style="width: {percentage}%"
													title="{item.hamlet}: {formatNumber(item.households)} households"
												>
													<div
														class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded-lg bg-black px-3 py-2 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
													>
														<div class="font-semibold">{item.hamlet}</div>
														<div>
															{$t('common.dashboard.charts.households_label')}: {formatNumber(
																item.households
															)}
														</div>
														<div>
															{$t('common.dashboard.charts.population_label')}: {formatNumber(
																item.total_population
															)}
														</div>
														<div
															class="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-black"
														></div>
													</div>
												</div>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		{/if}
	{/if}
</div>
