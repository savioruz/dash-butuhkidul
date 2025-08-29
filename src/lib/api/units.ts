import { apiClient } from './client';
import type {
	CreateUnitRequest,
	UpdateUnitRequest,
	GetUnitsResponse,
	GetUnitResponse,
	GetUnitMembersResponse,
	GetUnitMemberResponse,
	GetUnitMembersByUnitResponse,
	ApiResponse
} from '$lib/types/unit';

export const unitApi = {
	// Unit CRUD operations
	async getUnits(): Promise<GetUnitsResponse> {
		return apiClient.request('/v1/units');
	},

	async getUnit(id: string): Promise<GetUnitResponse> {
		return apiClient.request(`/v1/units/${id}`);
	},

	async createUnit(data: CreateUnitRequest): Promise<ApiResponse> {
		return apiClient.request('/v1/units', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	},

	async updateUnit(id: string, data: UpdateUnitRequest): Promise<ApiResponse> {
		return apiClient.request(`/v1/units/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(data)
		});
	},

	async deleteUnit(id: string): Promise<ApiResponse> {
		return apiClient.request(`/v1/units/${id}`, {
			method: 'DELETE'
		});
	}
};

export const unitMemberApi = {
	// Unit Member CRUD operations
	async getUnitMembers(): Promise<GetUnitMembersResponse> {
		return apiClient.request('/v1/units-members');
	},

	async getUnitMember(id: string): Promise<GetUnitMemberResponse> {
		return apiClient.request(`/v1/units-members/${id}`);
	},

	async createUnitMember(data: FormData): Promise<ApiResponse> {
		return apiClient.request('/v1/units-members', {
			method: 'POST',
			body: data,
			headers: {} // Remove Content-Type to let browser set it for FormData
		});
	},

	async updateUnitMember(id: string, data: FormData): Promise<ApiResponse> {
		return apiClient.request(`/v1/units-members/${id}`, {
			method: 'PATCH',
			body: data,
			headers: {} // Remove Content-Type to let browser set it for FormData
		});
	},

	async deleteUnitMember(id: string): Promise<ApiResponse> {
		return apiClient.request(`/v1/units-members/${id}`, {
			method: 'DELETE'
		});
	},

	async getUnitMembersByUnit(unitId: string): Promise<GetUnitMembersByUnitResponse> {
		return apiClient.request(`/v1/units/${unitId}/members`);
	}
};
