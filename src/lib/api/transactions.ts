import { apiClient } from './client';

export interface CreateTransactionRequest {
	amount: number;
	date: string;
	type: 'income' | 'expense';
	description?: string;
	category: string;
	file?: File;
	active: boolean;
}

export interface UpdateTransactionRequest {
	amount?: number;
	type?: 'income' | 'expense';
	description?: string;
	category?: string;
	active?: boolean;
	file?: File;
}

export interface TransactionFilters {
	amount?: string;
	date?: string;
	type?: 'income' | 'expense';
	description?: string;
	active?: boolean;
	created_at?: string;
	category?: string;
	// Pagination parameters
	page?: number;
	limit?: number;
}

export const transactionsApi = {
	async getTransactions(filters?: TransactionFilters) {
		const params = new URLSearchParams();
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined) {
					params.append(key, String(value));
				}
			});
		}

		const query = params.toString();
		const endpoint = query ? `/v1/transactions?${query}` : '/v1/transactions';

		return apiClient.request(endpoint);
	},

	async getTransaction(id: string) {
		return apiClient.request(`/v1/transactions/${id}`);
	},

	async createTransaction(data: CreateTransactionRequest) {
		const formData = new FormData();
		formData.append('amount', String(data.amount));
		formData.append('date', data.date);
		formData.append('type', data.type);
		formData.append('category', data.category);
		formData.append('active', String(data.active));

		if (data.description) {
			formData.append('description', data.description);
		}

		if (data.file) {
			formData.append('file', data.file);
		}

		return apiClient.request('/v1/transactions', {
			method: 'POST',
			headers: {},
			body: formData
		});
	},

	async updateTransaction(id: string, data: UpdateTransactionRequest) {
		const formData = new FormData();

		if (data.amount !== undefined) formData.append('amount', String(data.amount));
		if (data.type !== undefined) formData.append('type', data.type);
		if (data.description !== undefined) formData.append('description', data.description);
		if (data.category !== undefined) formData.append('category', data.category);
		if (data.active !== undefined) formData.append('active', String(data.active));
		if (data.file !== undefined) formData.append('file', data.file);

		return apiClient.request(`/v1/transactions/${id}`, {
			method: 'PATCH',
			headers: {},
			body: formData
		});
	},

	async deleteTransaction(id: string) {
		return apiClient.request(`/v1/transactions/${id}`, {
			method: 'DELETE'
		});
	},

	async getTransactionsSummary(
		filters?: Pick<TransactionFilters, 'type' | 'active' | 'created_at' | 'category'>
	) {
		const params = new URLSearchParams();
		if (filters) {
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined) {
					params.append(key, String(value));
				}
			});
		}

		const query = params.toString();
		const endpoint = query ? `/v1/transactions/summary?${query}` : '/v1/transactions/summary';

		return apiClient.request(endpoint);
	}
};
