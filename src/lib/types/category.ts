import { type Response } from './api';

export interface Category {
	id: string;
	name: string;
	description?: string;
	active: boolean;
	created_at: string;
	modified_at: string;
	created_by: string;
	modified_by: string;
}

export interface GetCategoriesData {
	categories: Category[];
	total_data: number;
	total_page: number;
}

export type GetCategoriesResponse = Response<GetCategoriesData>;

export type GetCategoryResponse = Response<Category>;

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
