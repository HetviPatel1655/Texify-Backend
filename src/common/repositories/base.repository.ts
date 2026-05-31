import { buildPagination, buildSearchWhere, buildSort } from "../utils/query";

export interface RepositoryListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface RepositoryListResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function createListQuery(options: RepositoryListOptions, searchableFields: string[] = []) {
  const pagination = buildPagination(options.page, options.limit);
  const orderBy = buildSort(options.sortBy, options.sortOrder);
  const searchWhere = buildSearchWhere(searchableFields, options.search);

  return {
    pagination,
    orderBy,
    searchWhere
  };
}