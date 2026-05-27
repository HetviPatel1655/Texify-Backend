import type { SortDirection } from "../types/query";

export function normalizePage(page?: number): number {
  return Number.isFinite(page) && page && page > 0 ? Math.floor(page) : 1;
}

export function normalizeLimit(limit?: number, fallback = 20, max = 100): number {
  const value = Number.isFinite(limit) && limit ? Math.floor(limit) : fallback;
  return Math.min(Math.max(value, 1), max);
}

export function buildPagination(page?: number, limit?: number) {
  const normalizedPage = normalizePage(page);
  const normalizedLimit = normalizeLimit(limit);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit,
    take: normalizedLimit
  };
}

export function buildSort(sortBy?: string, sortOrder: SortDirection = "desc") {
  if (!sortBy) {
    return undefined;
  }

  return {
    [sortBy]: sortOrder
  };
}

export function buildSearchWhere(fields: string[], search?: string) {
  if (!search || !search.trim()) {
    return {};
  }

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: search.trim(),
        mode: "insensitive" as const
      }
    }))
  };
}