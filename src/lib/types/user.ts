import { type Response } from './api';

/**
 * User levels hierarchy
 */
export const USER_LEVELS = {
	SUPER_ADMIN: 0,
	ADMIN: 1,
	USER: 2
} as const;

/**
 * User level labels for display
 */
export const USER_LEVEL_LABELS = {
	'0': 'Super Admin',
	'1': 'Admin',
	'2': 'User'
} as const;

export interface User {
	id: string;
	email: string;
	full_name: string;
	level: '0' | '1' | '2'; // '0': Super Admin, '1': Admin, '2': User
	is_verified: boolean;
	active: boolean;
	profile_image?: string;
	last_login?: string;
	created_at: string;
	modified_at: string;
	created_by: string;
	modified_by: string;
}

export interface GetUsersData {
	users: User[];
	total_data: number;
	total_page: number;
	current_page: number;
	limit: number;
}

export type GetUsersResponse = Response<GetUsersData>;
export type GetUserResponse = Response<User>;

// API Request types
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

export interface UserFilters {
	email?: string;
	full_name?: string;
	level?: string;
	is_verified?: boolean;
	active?: boolean;
	page?: number;
	limit?: number;
}

export type UserLevel = '0' | '1' | '2';
