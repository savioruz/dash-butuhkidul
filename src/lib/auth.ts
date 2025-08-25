import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export function getAccessToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem('accessToken');
}

export function getRefreshToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem('refreshToken');
}

export function setTokens(accessToken: string, refreshToken?: string): void {
	if (!browser) return;

	localStorage.setItem('accessToken', accessToken);
	if (refreshToken) {
		localStorage.setItem('refreshToken', refreshToken);
	}
}

export function clearTokens(): void {
	if (!browser) return;

	localStorage.removeItem('accessToken');
	localStorage.removeItem('refreshToken');
}

export function isTokenExpired(token: string): boolean {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return true;

		const payload = parts[1];
		// Use atob for browser environment
		const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
		const data = JSON.parse(decoded);

		if (!data || !data.exp) return true;

		const now = Math.floor(Date.now() / 1000);
		return data.exp < now;
	} catch {
		return true;
	}
}

export function isAuthenticated(): boolean {
	const token = getAccessToken();
	if (!token) return false;
	return !isTokenExpired(token);
}

export function requireAuth(): void {
	if (!browser) return;

	if (!isAuthenticated()) {
		clearTokens();
		goto('/');
	}
}

export function logout(): void {
	clearTokens();
	goto('/');
}
