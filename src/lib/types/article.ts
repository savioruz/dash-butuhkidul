export interface Article {
	id: string;
	title: string;
	content: string;
	cover_url?: string;
	slug: string;
	active: boolean;
	published_at?: string;
	created_at: string;
	modified_at: string;
	created_by: string;
	modified_by?: string;
}

// API Request/Response types
export interface CreateArticleRequest {
	title: string;
	content: string;
	active: boolean;
	published_at?: string;
}

export interface UpdateArticleRequest {
	title?: string;
	content?: string;
	active?: string; // API expects string for PATCH
	published_at?: string;
}

export interface GetArticlesResponse {
	data?: {
		articles: Article[];
		total_data: number;
		total_page: number;
		current_page: number;
		limit: number;
	};
	articles?: Article[];
	total_data?: number;
	total_page?: number;
}

export interface GetArticleResponse {
	success: boolean;
	data: Article;
	message: string;
}

export interface ApiResponse {
	message: string;
}
