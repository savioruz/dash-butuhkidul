// Main API exports
export { apiClient } from './client';
export * from './config';

// Auth API
export {
	authApi,
	type LoginRequest,
	type LoginResponse,
	type RefreshTokenRequest,
	type RefreshTokenResponse
} from './auth';

// Categories API
export {
	categoriesApi,
	type CreateCategoryRequest,
	type UpdateCategoryRequest
} from './categories';

// Transactions API
export {
	transactionsApi,
	type CreateTransactionRequest,
	type UpdateTransactionRequest,
	type TransactionFilters
} from './transactions';

// Users API
export {
	usersApi,
	type CreateUserRequest,
	type UpdateProfileRequest,
	type UpdateRoleRequest,
	type ChangePasswordRequest,
	type UserFilters
} from './users';

// Village API
export { villageApi, villageHistoryApi } from './village';

// Legacy compatibility - keeping the old structure for backward compatibility
import { authApi } from './auth';
import { categoriesApi } from './categories';
import { transactionsApi } from './transactions';
import { usersApi } from './users';
import { villageApi, villageHistoryApi } from './village';

export const api = {
	auth: authApi,
	categories: categoriesApi,
	transactions: transactionsApi,
	users: usersApi,
	village: villageApi,
	villageHistory: villageHistoryApi
};
