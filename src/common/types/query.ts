export type SortDirection = "asc" | "desc";

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface SortQuery {
  sortBy?: string;
  sortOrder?: SortDirection;
}

export interface SearchQuery {
  search?: string;
}

export interface ListQuery extends PaginationQuery, SortQuery, SearchQuery {
  filters?: Record<string, unknown>;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}