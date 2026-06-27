import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { YarnSendDto, YarnSendItemDto, YarnSendListQuery } from "./yarn-send-jobwork.types";
import { yarnSendSearchableFields } from "./yarn-send-jobwork.constants";

const itemSelect = {
  id: true,
  cartonNo: true,
  itemName: true,
  shadeName: true,
  lotNo: true,
  denier: true,
  twist: true,
  twistDirection: true,
  cheese: true,
  grossWt: true,
  tareWt: true,
  netWt: true,
  remarks: true,
  sortOrder: true,
} as const;

const yarnSendSelect = {
  id: true,
  serialNumber: true,
  challanDate: true,
  challanNo: true,
  firmId: true,
  firm: { select: { name: true } },
  partyId: true,
  party: { select: { name: true } },
  totalCartons: true,
  totalCheese: true,
  totalGrossWt: true,
  totalTareWt: true,
  totalNetWt: true,
  goodsRate: true,
  goodsAmount: true,
  remarks: true,
  items: { select: itemSelect, orderBy: { sortOrder: "asc" as const } },
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

type YarnSendRow = Prisma.YarnSendJobworkGetPayload<{ select: typeof yarnSendSelect }>;

function itemToDto(row: any): YarnSendItemDto {
  return {
    id: row.id,
    cartonNo: row.cartonNo,
    itemName: row.itemName,
    shadeName: row.shadeName,
    lotNo: row.lotNo,
    denier: row.denier,
    twist: row.twist,
    twistDirection: row.twistDirection,
    cheese: formatDecimalValue(row.cheese),
    grossWt: formatDecimalValue(row.grossWt),
    tareWt: formatDecimalValue(row.tareWt),
    netWt: formatDecimalValue(row.netWt),
    remarks: row.remarks,
    sortOrder: row.sortOrder,
  };
}

function toDto(row: YarnSendRow): YarnSendDto {
  return {
    id: row.id,
    serialNumber: row.serialNumber,
    challanDate: row.challanDate.toISOString(),
    challanNo: row.challanNo,
    firmId: row.firmId,
    firmName: row.firm?.name ?? null,
    partyId: row.partyId,
    partyName: row.party?.name ?? null,
    totalCartons: row.totalCartons,
    totalCheese: formatDecimalValue(row.totalCheese),
    totalGrossWt: formatDecimalValue(row.totalGrossWt),
    totalTareWt: formatDecimalValue(row.totalTareWt),
    totalNetWt: formatDecimalValue(row.totalNetWt),
    goodsRate: formatDecimalValue(row.goodsRate),
    goodsAmount: formatDecimalValue(row.goodsAmount),
    remarks: row.remarks,
    items: row.items.map(itemToDto),
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById,
    updatedById: row.updatedById,
    createdByName: row.createdBy?.name ?? null,
    updatedByName: row.updatedBy?.name ?? null,
  };
}

export class YarnSendJobworkRepository {
  async list(query: YarnSendListQuery, tenantId: string): Promise<RepositoryListResult<YarnSendDto>> {
    const listQuery = createListQuery(query, [...yarnSendSearchableFields]);
    const searchWhere = buildSearchWhere([...yarnSendSearchableFields], query.search);

    const where: Prisma.YarnSendJobworkWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.firmId ? { firmId: query.firmId } : {}),
      ...(query.partyId ? { partyId: query.partyId } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            challanDate: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
      ...searchWhere,
    };

    const [rows, total] = await prisma.$transaction([
      prisma.yarnSendJobwork.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: yarnSendSelect,
      }),
      prisma.yarnSendJobwork.count({ where }),
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

  async findById(id: string, tenantId: string): Promise<YarnSendDto | null> {
    const row = await prisma.yarnSendJobwork.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: yarnSendSelect,
    });
    return row ? toDto(row) : null;
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.yarnSendJobwork.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.yarnSendJobwork.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getNextSerialNumber(tenantId: string): Promise<string> {
    const fiscalYear = this.getCurrentFiscalYear();
    const prefix = `YSJ-${fiscalYear}`;
    const last = await prisma.yarnSendJobwork.findFirst({
      where: { tenantId, serialNumber: { startsWith: prefix } },
      orderBy: { serialNumber: "desc" },
      select: { serialNumber: true },
    });

    let nextSeq = 1;
    if (last) {
      const parts = last.serialNumber.split("-");
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
    }

    return `${prefix}-${String(nextSeq).padStart(4, "0")}`;
  }

  private getCurrentFiscalYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
  }
}
