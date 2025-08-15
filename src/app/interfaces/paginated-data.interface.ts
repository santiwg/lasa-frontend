export interface PaginatedData<T> {
    data: T[];
    hasMore: boolean;
}