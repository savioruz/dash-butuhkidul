import { apiClient } from './client';

export interface DashboardSummary {
	total_income: number;
	total_expense: number;
}

export interface PopulationData {
	hamlet: string;
	male: number;
	female: number;
	children: number;
	elderly: number;
	toddlers: number;
	wives: number;
	households: number;
	total_population: number;
}

export interface DashboardStats {
	totalArticles: number;
	totalCategories: number;
	totalUnits: number;
	totalUnitMembers: number;
	totalUsers?: number;
}

interface ApiResponse<T = unknown> {
	data?: T;
	total_data?: number;
}

export const dashboardApi = {
	async getTransactionSummary(): Promise<{ data: DashboardSummary }> {
		return apiClient.request('/v1/transactions/summary');
	},

	async getPopulation(): Promise<{ data: { population: PopulationData[] } }> {
		return apiClient.request('/v1/populations');
	},

	async getDashboardStats(): Promise<DashboardStats> {
		try {
			// Get all the counts in parallel
			const [articlesRes, categoriesRes, unitsRes, unitMembersRes] = await Promise.all([
				apiClient.request('/v1/articles'),
				apiClient.request('/v1/categories'),
				apiClient.request('/v1/units'),
				apiClient.request('/v1/units-members')
			]);

			return {
				totalArticles: (articlesRes as ApiResponse)?.total_data || 0,
				totalCategories: (categoriesRes as ApiResponse)?.total_data || 0,
				totalUnits: (unitsRes as ApiResponse)?.total_data || 0,
				totalUnitMembers: (unitMembersRes as ApiResponse)?.total_data || 0
			};
		} catch (error) {
			console.error('Error fetching dashboard stats:', error);
			return {
				totalArticles: 0,
				totalCategories: 0,
				totalUnits: 0,
				totalUnitMembers: 0
			};
		}
	}
};
