import { apiClient } from './client';
import { type Response } from '$lib/types/api';

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginData {
	access_token: string;
	refresh_token: string;
}

export interface LoginResponse {
	access_token: string;
	refresh_token: string;
}

export interface RefreshTokenRequest {
	refresh_token: string;
}

export interface RefreshTokenResponse {
	access_token: string;
	refresh_token: string;
}

export const authApi = {
	async login(credentials: LoginRequest): Promise<LoginResponse> {
		const response = await apiClient.request<Response<LoginData>>('/v1/auth/login', {
			method: 'POST',
			body: JSON.stringify(credentials)
		});

		// Extract the data from the Response wrapper
		if (response.data) {
			return response.data;
		}

		// Fallback for direct response (if API doesn't use wrapper for auth)
		return response as unknown as LoginResponse;
	},

	async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
		const response = await apiClient.request<Response<LoginData>>('/v1/auth/refresh-token', {
			method: 'POST',
			body: JSON.stringify(data)
		});

		// Extract the data from the Response wrapper
		if (response.data) {
			return response.data;
		}

		// Fallback for direct response
		return response as unknown as RefreshTokenResponse;
	}
};
