import { apiClient } from './client';

export interface CreateUserRequest {
	email: string;
	full_name: string;
	password: string;
	level: '1' | '2';
	is_verified?: boolean;
	profile_image?: string;
}

export interface UpdateProfileRequest {
	full_name?: string;
}

export interface UpdateRoleRequest {
	level: '1' | '2' | '3';
}

export interface ChangePasswordRequest {
	old_password: string;
	new_password: string;
}

export interface UserFilters {
	email?: string;
	full_name?: string;
	level?: string;
	is_verified?: boolean;
	active?: boolean;
}

export const usersApi = {
	async getUsers(filters?: UserFilters) {
		const params = new URLSearchParams();
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined) {
					params.append(key, String(value));
				}
			});
		}

		const query = params.toString();
		const endpoint = query ? `/v1/users?${query}` : '/v1/users';

		return apiClient.request(endpoint);
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
