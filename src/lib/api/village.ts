import { apiClient } from './client';
import type { UpdateVillageRequest, UpdateVillageHistoryRequest } from '$lib/types/village';

export const villageApi = {
	async getVillages() {
		return apiClient.request('/v1/villages');
	},

	async updateVillage(id: string, data: UpdateVillageRequest) {
		return apiClient.request(`/v1/villages/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(data)
		});
	}
};

export const villageHistoryApi = {
	async getVillageHistories() {
		return apiClient.request('/v1/villages/history');
	},

	async updateVillageHistory(id: string, data: UpdateVillageHistoryRequest) {
		const formData = new FormData();
		formData.append('description', data.description);

		if (data.file) {
			formData.append('file', data.file);
		}

		return apiClient.request(`/v1/villages/history/${id}`, {
			method: 'PATCH',
			headers: {},
			body: formData
		});
	}
};
