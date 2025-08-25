export const siteConfig = {
	name: 'dashboard butuhkidul',
	logo: '/favicon.svg',
	description: 'A dashboard for managing butuhkidul site',
	keywords: '',
	url: new URL('https://dash.butuhkidul.my.id'),
	ogImage: new URL('https://dash.butuhkidul.my.id/og.png'),
	links: {
		twitter: new URL('https://twitter.com/example'), // @TODO - Replace with your Twitter URL
		github: new URL('https://github.com/example') // @TODO - Replace with your GitHub URL
	},
	googleVerification: '@TODO - Replace with your Google verification code',
	yandexVerification: '@TODO - Replace with your Yandex verification code'
} as const;

export type SiteConfig = typeof siteConfig;
