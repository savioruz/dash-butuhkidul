import { CircleDollarSign } from 'lucide-svelte';

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
		}
	]
};
