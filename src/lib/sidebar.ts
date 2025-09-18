import { CircleDollarSign, Home, MapPin, Newspaper, Users } from 'lucide-svelte';
import { getUserLevel as getJWTUserLevel } from '$lib/utils/jwt.js';
import type { ComponentType } from 'svelte';

interface SidebarItem {
	title: string;
	url: string;
	requiredLevel?: number; // 0 = super admin, 1 = admin, undefined = all authenticated users
}

interface SidebarGroup {
	title: string;
	icon: ComponentType;
	isActive: boolean;
	items: SidebarItem[];
	requiredLevel?: number; // Hide entire group if user doesn't have permission
}

export type { SidebarItem, SidebarGroup };

export const sidebarItems = {
	navMain: [
		{
			title: 'navigation.sidebar.dashboard.title',
			icon: Home,
			isActive: true,
			items: [
				{
					title: 'navigation.sidebar.dashboard.title',
					url: '/dashboard'
				}
			]
		},
		{
			title: 'navigation.sidebar.finance.title',
			icon: CircleDollarSign,
			isActive: true,
			requiredLevel: 1,
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
			requiredLevel: 1,
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
			requiredLevel: 1,
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
		},
		{
			title: 'navigation.sidebar.users.title',
			icon: Users,
			isActive: true,
			items: [
				{
					title: 'navigation.sidebar.users.management',
					url: '/dashboard/users',
					requiredLevel: 0
				},
				{
					title: 'navigation.sidebar.users.password',
					url: '/dashboard/change-password'
				}
			]
		}
	] as SidebarGroup[]
};

/**
 * Filter sidebar items based on user permissions
 * @returns Filtered sidebar items that user has permission to see
 */
export function getFilteredSidebarItems(): SidebarGroup[] {
	const userLevel = getUserLevel();

	return sidebarItems.navMain
		.filter((group) => {
			// Check if user has permission for the group
			if (group.requiredLevel !== undefined) {
				if (userLevel === null || userLevel > group.requiredLevel) {
					return false;
				}
			}

			// Filter items within the group
			const filteredItems = group.items.filter((item) => {
				if (item.requiredLevel !== undefined) {
					if (userLevel === null || userLevel > item.requiredLevel) {
						return false;
					}
				}
				return true;
			});

			// Only include group if it has visible items
			return filteredItems.length > 0;
		})
		.map((group) => ({
			...group,
			items: group.items.filter((item) => {
				if (item.requiredLevel !== undefined) {
					if (userLevel === null || userLevel > item.requiredLevel) {
						return false;
					}
				}
				return true;
			})
		}));
}

function getUserLevel(): number | null {
	try {
		if (typeof window !== 'undefined') {
			return getJWTUserLevel();
		}
		return null;
	} catch (error) {
		console.error('Error getting user level:', error);
		return null;
	}
}
