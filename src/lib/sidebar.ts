import { CircleDollarSign, MapPin, Newspaper } from 'lucide-svelte';

export const sidebarItems = {
	navMain: [
		{
			title: 'navigation.sidebar.finance.title',
			icon: CircleDollarSign,
			isActive: true,
			items: [
				{
					title: 'navigation.sidebar.finance.categories',
					url: '/dashboard/finances/categories'
				},
				{
					title: 'navigation.sidebar.finance.income_transactions',
					url: '/dashboard/finances/transactions/income'
				},
				{
					title: 'navigation.sidebar.finance.expense_transactions',
					url: '/dashboard/finances/transactions/expense'
				}
			]
		},
		{
			title: 'navigation.sidebar.articles.title',
			icon: Newspaper,
			isActive: true,
			items: [
				{
					title: 'navigation.sidebar.articles.articles',
					url: '/dashboard/articles'
				}
			]
		},
		{
			title: 'navigation.sidebar.village.title',
			icon: MapPin,
			isActive: true,
			items: [
				{
					title: 'navigation.sidebar.village.profiles',
					url: '/dashboard/villages/profiles'
				},
				{
					title: 'navigation.sidebar.village.histories',
					url: '/dashboard/villages/histories'
				},
				{
					title: 'navigation.sidebar.village.units',
					url: '/dashboard/villages/units'
				},
				{
					title: 'navigation.sidebar.village.unit_members',
					url: '/dashboard/villages/unit-members'
				}
			]
		}
	]
};
