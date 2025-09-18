const base_url = import.meta.env.VITE_BASE_URL || '/';
const domainTrim = base_url.replace(/https?:\/\//, '').replace(/\/$/, '');

export interface NavItem {
	href: string;
	label: string;
	translationKey: string;
}

export const navigationConfig: NavItem[] = [
	{
		href: `https://${domainTrim}`,
		label: 'Home',
		translationKey: 'home'
	},
	{
		href: `https://kas.${domainTrim}`,
		label: 'Finance',
		translationKey: 'finance'
	}
];
