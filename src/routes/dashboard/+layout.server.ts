import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

/**
 * Check if JWT token is expired (server-side)
 */
function isTokenExpired(token: string): boolean {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return true;

		const payload = parts[1];
		const decoded = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
			'utf-8'
		);
		const data = JSON.parse(decoded);

		if (!data || !data.exp) return true;

		const now = Math.floor(Date.now() / 1000);
		return data.exp < now;
	} catch {
		return true;
	}
}

export const load: LayoutServerLoad = async ({ cookies }) => {
	const accessToken = cookies.get('accessToken');

	console.log('Dashboard access check:', {
		hasToken: !!accessToken,
		tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none'
	});

	if (!accessToken || isTokenExpired(accessToken)) {
		console.log('Redirecting to login:', !accessToken ? 'no token' : 'expired token');
		throw redirect(303, '/');
	}

	return {};
};
