import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { API_BASE_URL } from '$lib/types/api';

export class ApiClient {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;

		const config: RequestInit = {
			headers: {
				'Content-Type': 'application/json',
				...options.headers
			},
			...options
		};

		// Add auth token if available
		if (browser) {
			const token = localStorage.getItem('accessToken');
			if (token) {
				config.headers = {
					...config.headers,
					Authorization: `Bearer ${token}`
				};
			}
		}

		const response = await fetch(url, config);

		if (response.status === 401 && browser) {
			localStorage.removeItem('accessToken');
			localStorage.removeItem('refreshToken');
			goto('/');
			throw new Error('Unauthorized');
		}

		const data = await response.json();

		if (!response.ok) {
			console.error('API Error:', { status: response.status, data }); // Debug log
			throw new Error(
				data.error || data.message || `API request failed with status ${response.status}`
			);
		}

		return data;
	}
}

export const apiClient = new ApiClient(API_BASE_URL);
