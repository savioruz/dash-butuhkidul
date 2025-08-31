import { apiClient } from './client';
import type {
	CreateArticleRequest,
	UpdateArticleRequest,
	GetArticlesResponse,
	GetArticleResponse,
	ApiResponse
} from '$lib/types/article';

// Re-export types for convenience
export type {
	CreateArticleRequest,
	UpdateArticleRequest,
	GetArticlesResponse,
	GetArticleResponse
} from '$lib/types/article';

export const articleApi = {
	// Article CRUD operations
	async getArticles(): Promise<GetArticlesResponse> {
		const response = await apiClient.request('/v1/articles');
		return response as GetArticlesResponse;
	},

	async getArticle(id: string): Promise<GetArticleResponse> {
		return apiClient.request(`/v1/articles/id/${id}`);
	},

	async getArticleBySlug(slug: string): Promise<GetArticleResponse> {
		return apiClient.request(`/v1/articles/${slug}`);
	},

	async createArticle(data: CreateArticleRequest, file?: File): Promise<ApiResponse> {
		const formData = new FormData();
		formData.append('title', data.title);
		formData.append('content', data.content);
		formData.append('active', data.active.toString()); // API expects boolean but as form string

		if (data.published_at) {
			// Convert datetime-local format to API expected format: 2006-01-02 15:04:05
			let formattedDate: string;
			if (data.published_at.includes('T')) {
				// datetime-local format: 2023-12-31T23:59
				formattedDate = data.published_at.replace('T', ' ') + ':00';
			} else {
				// Assume it's already in the correct format
				formattedDate = data.published_at;
			}
			formData.append('published_at', formattedDate);
		}

		if (file) {
			formData.append('file', file);
		}

		return apiClient.request('/v1/articles', {
			method: 'POST',
			body: formData
		});
	},

	async updateArticle(id: string, data: UpdateArticleRequest, file?: File): Promise<ApiResponse> {
		const formData = new FormData();

		if (data.title) {
			formData.append('title', data.title);
		}

		if (data.content) {
			formData.append('content', data.content);
		}

		if (data.active !== undefined) {
			formData.append('active', data.active); // API expects string for PATCH
		}

		if (file) {
			formData.append('file', file);
		}

		return apiClient.request(`/v1/articles/${id}`, {
			method: 'PATCH',
			body: formData
		});
	},

	async deleteArticle(id: string): Promise<ApiResponse> {
		return apiClient.request(`/v1/articles/${id}`, {
			method: 'DELETE'
		});
	}
};
