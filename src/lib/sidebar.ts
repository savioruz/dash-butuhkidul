import { CircleDollarSign, MapPin } from 'lucide-svelte';

export const sidebarItems = {
	navMain: [
		{
			title: 'navigation.sidebar.finance.title',
			icon: CircleDollarSign,
			isActive: true,
			items: [
				{
					title: 'navigation.sidebar.finance.categories',
					url: '/dashboard/finance/categories'
				},
				{
					title: 'navigation.sidebar.finance.income_transactions',
					url: '/dashboard/finance/transactions/income'
				},
				{
					title: 'navigation.sidebar.finance.expense_transactions',
					url: '/dashboard/finance/transactions/expense'
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
					url: '/dashboard/village/profiles'
				},
				{
					title: 'navigation.sidebar.village.histories',
					url: '/dashboard/village/histories'
				},
				{
					title: 'navigation.sidebar.village.units',
					url: '/dashboard/village/units'
				},
				{
					title: 'navigation.sidebar.village.unit_members',
					url: '/dashboard/village/unit-members'
				}
			]
		}
	]
};
