import { type Response } from './api';

export interface Village {
	id: string;
	name: string;
	address: string;
	latitude: number;
	longitude: number;
	created_at: string;
	modified_at: string;
	created_by: string;
	modified_by: string;
}

export interface VillageHistory {
	id: string;
	description: string;
	image_url: string;
	village_id: string;
	created_at: string;
	modified_at: string;
	created_by: string;
	modified_by: string;
}

export interface GetVillagesData {
	villages: Village[];
}

export interface GetVillageHistoriesData {
	village_histories: VillageHistory[];
}

export type GetVillagesResponse = Response<GetVillagesData>;
export type GetVillageHistoriesResponse = Response<GetVillageHistoriesData>;

export interface UpdateVillageRequest {
	name?: string;
	address?: string;
	latitude?: number;
	longitude?: number;
}

export interface UpdateVillageHistoryRequest {
	description: string;
	file?: File;
}
