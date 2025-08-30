import { browser } from '$app/environment';

/**
 * Decode JWT token payload without verification
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decodeJWT(token: string): any | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;

		const payload = parts[1];
		// Handle both browser and server environments
		let decoded: string;
		if (typeof atob !== 'undefined') {
			// Browser environment
			decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
		} else {
			// Server environment (Node.js)
			decoded = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
				'utf-8'
			);
		}
		return JSON.parse(decoded);
	} catch {
		return null;
	}
}

/**
 * Check if JWT token is expired
 * @param token JWT token string
 * @returns true if expired, false if valid
 */
export function isTokenExpired(token: string): boolean {
	const payload = decodeJWT(token);
	if (!payload || !payload.exp) return true;

	const now = Math.floor(Date.now() / 1000);
	return payload.exp < now;
}

/**
 * Check if token expires soon (within 5 minutes)
 * @param token JWT token string
 * @returns true if expires soon, false otherwise
 */
export function isTokenExpiringSoon(token: string): boolean {
	const payload = decodeJWT(token);
	if (!payload || !payload.exp) return true;

	const now = Math.floor(Date.now() / 1000);
	const fiveMinutes = 5 * 60; // 5 minutes in seconds
	return payload.exp < now + fiveMinutes;
}

/**
 * Get token expiration date
 * @param token JWT token string
 * @returns Date object or null if invalid
 */
export function getTokenExpiration(token: string): Date | null {
	const payload = decodeJWT(token);
	if (!payload || !payload.exp) return null;

	return new Date(payload.exp * 1000);
}

/**
 * Get time until token expiration in a human-readable format
 * @param token JWT token string
 * @returns String like "5m 30s" or "Expired" or null if invalid token
 */
export function getTimeUntilExpiration(token: string): string | null {
	const expiration = getTokenExpiration(token);
	if (!expiration) return null;

	const now = new Date();
	const timeDiff = expiration.getTime() - now.getTime();

	if (timeDiff <= 0) return 'Expired';

	const minutes = Math.floor(timeDiff / (1000 * 60));
	const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

	if (minutes > 0) {
		return `${minutes}m ${seconds}s`;
	} else {
		return `${seconds}s`;
	}
}

// ===== AUTH FUNCTIONS =====

/**
 * Get access token from localStorage
 * @returns Access token or null if not found
 */
export function getAccessToken(): string | null {
	if (!browser || typeof window === 'undefined' || typeof localStorage === 'undefined') {
		return null;
	}
	try {
		return localStorage.getItem('accessToken');
	} catch {
		return null;
	}
}

/**
 * Get refresh token from localStorage
 * @returns Refresh token or null if not found
 */
export function getRefreshToken(): string | null {
	if (!browser || typeof window === 'undefined' || typeof localStorage === 'undefined') {
		return null;
	}
	try {
		return localStorage.getItem('refreshToken');
	} catch {
		return null;
	}
}

/**
 * Set tokens in localStorage
 * @param accessToken Access token to store
 * @param refreshToken Optional refresh token to store
 */
export function setTokens(accessToken: string, refreshToken?: string): void {
	if (!browser || typeof window === 'undefined' || typeof localStorage === 'undefined') {
		return;
	}

	try {
		localStorage.setItem('accessToken', accessToken);
		if (refreshToken) {
			localStorage.setItem('refreshToken', refreshToken);
		}
	} catch (error) {
		console.error('Failed to set tokens:', error);
	}
}

/**
 * Clear all tokens from localStorage
 */
export function clearTokens(): void {
	if (!browser || typeof window === 'undefined' || typeof localStorage === 'undefined') {
		return;
	}

	try {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
	} catch (error) {
		console.error('Failed to clear tokens:', error);
	}
}

/**
 * Check if user is authenticated (has valid access token)
 * @returns true if authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
	try {
		const token = getAccessToken();
		if (!token) return false;
		return !isTokenExpired(token);
	} catch (error) {
		console.error('Error checking authentication:', error);
		return false;
	}
}

/**
 * Require authentication - redirect to home if not authenticated
 */
export function requireAuth(): void {
	if (!browser) return;

	// Check if localStorage is available (prevents errors during SSR)
	if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
		return;
	}

	if (!isAuthenticated()) {
		clearTokens();
		// Use location.href for more reliable redirect during hard refresh
		window.location.href = '/';
	}
}

/**
 * Logout user - clear tokens and redirect to home
 */
export function logout(): void {
	clearTokens();
	// Use replace to avoid adding to browser history
	if (typeof window !== 'undefined') {
		window.location.replace('/');
	}
}
