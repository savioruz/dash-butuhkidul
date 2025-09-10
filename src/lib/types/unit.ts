export interface Unit {
	id: string;
	name: string;
	description?: string;
	created_at: string;
	updated_at: string;
}

export interface UnitMember {
	id: string;
	name: string;
	position: string;
	unit_id: string;
	unit?: Unit;
	photo_url?: string;
	created_at: string;
	updated_at: string;
}

// API Request/Response types
export interface CreateUnitRequest {
	name: string;
	description?: string;
}

export interface UpdateUnitRequest {
	name?: string;
	description?: string;
}

export interface CreateUnitMemberRequest {
	name: string;
	position: string;
	unit_id: string;
}

export interface UpdateUnitMemberRequest {
	name?: string;
	position?: string;
	unit_id?: string;
}

export interface GetUnitsResponse {
	success: boolean;
	data: {
		units: Unit[];
	};
	message: string;
}

export interface GetUnitResponse {
	success: boolean;
	data: {
		unit: Unit;
	};
	message: string;
}

export interface GetUnitMembersResponse {
	success: boolean;
	data: {
		unit_members: UnitMember[];
		total_data?: number;
		total_page?: number;
		current_page?: number;
		limit?: number;
	};
	message: string;
}

export interface GetUnitMemberResponse {
	success: boolean;
	data: {
		unit_member: UnitMember;
	};
	message: string;
}

export interface GetUnitMembersByUnitResponse {
	success: boolean;
	data: {
		unit_members: UnitMember[];
	};
	message: string;
}

export interface ApiResponse {
	success: boolean;
	message: string;
}
