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

export const categoriesApi = {
	async getCategories(): Promise<GetCategoriesResponse> {
		return apiClient.request('/v1/categories');
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
