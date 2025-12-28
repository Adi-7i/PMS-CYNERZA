// Common API response types

export interface ApiError {
    detail: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}
