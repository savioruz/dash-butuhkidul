import { apiClient } from './client';
import type { GetUsersResponse, GetUserResponse } from '$lib/types/user';

export interface CreateUserRequest {
	email: string;
	full_name: string;
	password: string;
	level: '0' | '1';
	is_verified?: boolean;
	profile_image?: string;
}

export interface UpdateProfileRequest {
	full_name?: string;
}

export interface UpdateRoleRequest {
	level: '0' | '1' | '2';
}

export interface ChangePasswordRequest {
	current_password: string;
	new_password: string;
}

export interface GetUsersParams {
	email?: string;
	full_name?: string;
	level?: string;
	is_verified?: boolean;
	active?: boolean;
	page?: number;
	limit?: number;
}

export const usersApi = {
	async getUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
		const searchParams = new URLSearchParams();
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined) {
					searchParams.append(key, String(value));
				}
			});
		}
		const queryString = searchParams.toString();
		const url = queryString ? `/v1/users?${queryString}` : '/v1/users';
		return apiClient.request(url);
	},

	async getUser(id: string): Promise<GetUserResponse> {
		return apiClient.request(`/v1/users/${id}`);
	},

	async createUser(data: CreateUserRequest) {
		return apiClient.request('/v1/users', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	},

	async deleteUser(id: string) {
		return apiClient.request(`/v1/users/${id}`, {
			method: 'DELETE'
		});
	},

	async updateProfile(id: string, data: UpdateProfileRequest) {
		return apiClient.request(`/v1/users/${id}/profile`, {
			method: 'PATCH',
			body: JSON.stringify(data)
		});
	},

	async updateRole(id: string, data: UpdateRoleRequest) {
		return apiClient.request(`/v1/users/${id}/role`, {
			method: 'PATCH',
			body: JSON.stringify(data)
		});
	},

	async changePassword(data: ChangePasswordRequest) {
		return apiClient.request('/v1/users/password', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}
};
