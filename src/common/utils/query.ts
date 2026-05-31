import type { SortDirection } from "../types/query";

export function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function toOptionalBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }

  return undefined;
}

export function parseSortDirection(value: unknown, fallback: SortDirection = "desc"): SortDirection {
  if (value === "asc" || value === "desc") {
    return value;
  }

  return fallback;
}

export function parseListQuery(query: Record<string, unknown>) {
  return {
    page: toOptionalNumber(query.page),
    limit: toOptionalNumber(query.limit),
    sortBy: toOptionalString(query.sortBy),
    sortOrder: parseSortDirection(query.sortOrder),
    search: toOptionalString(query.search),
    filters: Object.fromEntries(
      Object.entries(query).filter(([key, value]) => !["page", "limit", "sortBy", "sortOrder", "search"].includes(key) && value !== undefined && value !== null && value !== "")
    )
  };
}

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