import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { formatDecimalValue } from "../common/utils/decimal";
import type { GreyTPDto, GreyTPListQuery } from "./grey-tp.types";

const greyTPSelect = {
  id: true,
  takaId: true,
  taka: { select: { takaNo: true, itemName: true } },
  date: true,
  newMeters: true,
  originalMeters: true,
  newWeight: true,
  originalWeight: true,
  newSarees: true,
  originalSarees: true,
  remark: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

type GreyTPRow = Prisma.GreyTPGetPayload<{ select: typeof greyTPSelect }>;

function toDto(row: GreyTPRow): GreyTPDto {
  return {
    id: row.id,
    takaId: row.takaId,
    takaNo: row.taka.takaNo,
    itemName: row.taka.itemName,
    date: row.date.toISOString(),
    newMeters: formatDecimalValue(row.newMeters),
    originalMeters: formatDecimalValue(row.originalMeters),
    newWeight: formatDecimalValue(row.newWeight),
    originalWeight: formatDecimalValue(row.originalWeight),
    newSarees: row.newSarees,
    originalSarees: row.originalSarees,
    remark: row.remark,
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById,
    updatedById: row.updatedById,
    createdByName: row.createdBy?.name ?? null,
    updatedByName: row.updatedBy?.name ?? null,
  };
}

export class GreyTPRepository {
  async list(query: GreyTPListQuery, tenantId: string): Promise<RepositoryListResult<GreyTPDto>> {
    const listQuery = createListQuery(query, ["remark"]);

    const where: Prisma.GreyTPWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.takaId ? { takaId: query.takaId } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            date: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
    };

    const [rows, total] = await prisma.$transaction([
      prisma.greyTP.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: greyTPSelect,
      }),
      prisma.greyTP.count({ where }),
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

  async findById(id: string, tenantId: string): Promise<GreyTPDto | null> {
    const row = await prisma.greyTP.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: greyTPSelect,
    });
    return row ? toDto(row) : null;
  }

  async create(data: Prisma.GreyTPCreateInput): Promise<GreyTPDto> {
    const row = await prisma.greyTP.create({ data, select: greyTPSelect });
    return toDto(row);
  }

  async update(id: string, data: Prisma.GreyTPUpdateInput): Promise<GreyTPDto> {
    const row = await prisma.greyTP.update({ where: { id }, data, select: greyTPSelect });
    return toDto(row);
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.greyTP.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.greyTP.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
