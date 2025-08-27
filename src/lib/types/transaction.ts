import { type Response } from './api';

export interface Transaction {
	id: string;
	amount: number;
	date: string;
	type: 'income' | 'expense';
	description?: string; // Optional due to omitempty
	category: string;
	category_name: string;
	proof?: string; // Optional due to omitempty
	active: boolean;
	created_at: string;
	modified_at: string;
	created_by: string;
	modified_by: string;
}

export interface GetTransactionsData {
	transactions: Transaction[];
	total_data: number;
	total_page: number;
}

export type GetTransactionsResponse = Response<GetTransactionsData>;

export type GetTransactionResponse = Response<Transaction>;
