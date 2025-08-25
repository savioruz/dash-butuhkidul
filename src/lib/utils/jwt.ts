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
