import { apiClient } from './client';
import type { GetCategoriesResponse, GetCategoryResponse } from '@/types/category';

export interface CreateCategoryRequest {
	name: string;
	description?: string;
	active: boolean;
}

export interface UpdateCategoryRequest {
	name?: string;
	description?: string;
	active?: boolean;
}

export interface GetCategoriesParams {
	page?: number;
	limit?: number;
}

export const categoriesApi = {
	async getCategories(params?: GetCategoriesParams): Promise<GetCategoriesResponse> {
		const searchParams = new URLSearchParams();
		if (params?.page) {
			searchParams.append('page', params.page.toString());
		}
		if (params?.limit) {
			searchParams.append('limit', params.limit.toString());
		}
		const queryString = searchParams.toString();
		const url = queryString ? `/v1/categories?${queryString}` : '/v1/categories';
		return apiClient.request(url);
	},

	async getCategory(id: string): Promise<GetCategoryResponse> {
		return apiClient.request(`/v1/categories/${id}`);
	},

	async createCategory(data: CreateCategoryRequest) {
		return apiClient.request('/v1/categories', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	},

	async updateCategory(id: string, data: UpdateCategoryRequest) {
		return apiClient.request(`/v1/categories/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(data)
		});
	},

	async deleteCategory(id: string) {
		return apiClient.request(`/v1/categories/${id}`, {
			method: 'DELETE'
		});
	}
};
