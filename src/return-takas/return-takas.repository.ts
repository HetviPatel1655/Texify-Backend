import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { ReturnTakaDto, ReturnTakaListQuery } from "./return-takas.types";
import { returnTakaSearchableFields } from "./return-takas.constants";

const returnTakaSelect = {
  id: true,
  takaId: true,
  taka: { select: { takaNo: true, itemName: true, meters: true, weight: true, loomNo: true } },
  returnDate: true,
  partyId: true,
  party: { select: { name: true } },
  challanNo: true,
  rate: true,
  remarks: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

type ReturnTakaRow = Prisma.ReturnTakaGetPayload<{ select: typeof returnTakaSelect }>;

function toDto(row: ReturnTakaRow): ReturnTakaDto {
  return {
    id: row.id,
    takaId: row.takaId,
    takaNo: row.taka.takaNo,
    itemName: row.taka.itemName,
    meters: formatDecimalValue(row.taka.meters),
    weight: formatDecimalValue(row.taka.weight),
    loomNo: row.taka.loomNo,
    returnDate: row.returnDate.toISOString(),
    partyId: row.partyId,
    partyName: row.party?.name ?? null,
    challanNo: row.challanNo,
    rate: formatDecimalValue(row.rate),
    remarks: row.remarks,
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById,
    updatedById: row.updatedById,
    createdByName: row.createdBy?.name ?? null,
    updatedByName: row.updatedBy?.name ?? null,
  };
}

export class ReturnTakasRepository {
  async list(query: ReturnTakaListQuery, tenantId: string): Promise<RepositoryListResult<ReturnTakaDto>> {
    const listQuery = createListQuery(query, [...returnTakaSearchableFields]);
    const searchWhere = buildSearchWhere([...returnTakaSearchableFields], query.search);

    const where: Prisma.ReturnTakaWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.takaId ? { takaId: query.takaId } : {}),
      ...(query.partyId ? { partyId: query.partyId } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            returnDate: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
      ...searchWhere,
    };

    const [rows, total] = await prisma.$transaction([
      prisma.returnTaka.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: returnTakaSelect,
      }),
      prisma.returnTaka.count({ where }),
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

  async findById(id: string, tenantId: string): Promise<ReturnTakaDto | null> {
    const row = await prisma.returnTaka.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: returnTakaSelect,
    });
    return row ? toDto(row) : null;
  }

  async create(data: Prisma.ReturnTakaCreateInput): Promise<ReturnTakaDto> {
    const row = await prisma.returnTaka.create({ data, select: returnTakaSelect });
    return toDto(row);
  }

  async update(id: string, tenantId: string, data: Prisma.ReturnTakaUpdateInput): Promise<ReturnTakaDto> {
    const existing = await prisma.returnTaka.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!existing) throw new Error('Return taka not found');
    const row = await prisma.returnTaka.update({ where: { id }, data, select: returnTakaSelect });
    return toDto(row);
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.returnTaka.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.returnTaka.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
