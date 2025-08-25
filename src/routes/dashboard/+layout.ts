import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';

export const load = async () => {
	if (browser) {
		const token = localStorage.getItem('accessToken');
		if (!token) {
			throw redirect(302, '/');
		}
	}

	return {};
};
