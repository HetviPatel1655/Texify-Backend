import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { EmployeeDto, EmployeeListQuery } from "./employees.types";
import { employeeSearchableFields } from "./employees.constants";

const employeeSelect = {
  id: true,
  name: true,
  employeeType: true,
  dailyRate: true,
  isActive: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

type EmployeeRow = Prisma.EmployeeGetPayload<{ select: typeof employeeSelect }>;

function toDto(row: EmployeeRow): EmployeeDto {
  return {
    id: row.id,
    name: row.name,
    employeeType: row.employeeType,
    dailyRate: formatDecimalValue(row.dailyRate),
    isActive: row.isActive,
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById,
    updatedById: row.updatedById,
    createdByName: row.createdBy?.name ?? null,
    updatedByName: row.updatedBy?.name ?? null,
  };
}

export class EmployeesRepository {
  async list(query: EmployeeListQuery, tenantId: string): Promise<RepositoryListResult<EmployeeDto>> {
    const listQuery = createListQuery(query, [...employeeSearchableFields]);
    const searchWhere = buildSearchWhere([...employeeSearchableFields], query.search);

    const where: Prisma.EmployeeWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.employeeType ? { employeeType: query.employeeType as any } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive === "true" } : {}),
      ...searchWhere,
    };

    const [rows, total] = await prisma.$transaction([
      prisma.employee.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: employeeSelect,
      }),
      prisma.employee.count({ where }),
    ]);

    return {
      data: rows.map(toDto),
      meta: {
        page: listQuery.pagination.page,
        limit: listQuery.pagination.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / listQuery.pagination.limit)),
      },
    };
  }

  async findById(id: string, tenantId: string): Promise<EmployeeDto | null> {
    const row = await prisma.employee.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: employeeSelect,
    });
    return row ? toDto(row) : null;
  }

  async create(data: Prisma.EmployeeCreateInput): Promise<EmployeeDto> {
    const row = await prisma.employee.create({
      data,
      select: employeeSelect,
    });
    return toDto(row);
  }

  async update(id: string, tenantId: string, data: Prisma.EmployeeUpdateInput): Promise<EmployeeDto> {
    const existing = await prisma.employee.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!existing) throw new Error('Employee not found');
    const row = await prisma.employee.update({
      where: { id },
      data,
      select: employeeSelect,
    });
    return toDto(row);
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.employee.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
