import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { TakaReceiveDto, TakaReceiveItemDto, TakaReceiveListQuery } from "./taka-receive-jobwork.types";
import { takaReceiveSearchableFields } from "./taka-receive-jobwork.constants";

const itemSelect = {
  id: true,
  takaNo: true,
  loomNo: true,
  meters: true,
  weight: true,
  itemName: true,
  avgWeight: true,
  shouldBeWeight: true,
  weightDiff: true,
  grade: true,
  designNo: true,
  shadeName: true,
  beamTakaNo: true,
  cut: true,
  sarees: true,
  remarks: true,
  sortOrder: true,
} as const;

const takaReceiveSelect = {
  id: true,
  serialNumber: true,
  challanDate: true,
  challanNo: true,
  partyId: true,
  party: { select: { name: true } },
  firmId: true,
  firm: { select: { name: true } },
  qualityName: true,
  takaPrefix: true,
  lotNo: true,
  withBeam: true,
  totalTakas: true,
  totalMeters: true,
  totalWeight: true,
  totalSarees: true,
  originalChallanNo: true,
  originalChallanDate: true,
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

type TakaReceiveRow = Prisma.TakaReceiveJobworkGetPayload<{ select: typeof takaReceiveSelect }>;

function itemToDto(row: any): TakaReceiveItemDto {
  return {
    id: row.id,
    takaNo: row.takaNo,
    loomNo: row.loomNo,
    meters: formatDecimalValue(row.meters),
    weight: formatDecimalValue(row.weight),
    itemName: row.itemName,
    avgWeight: formatDecimalValue(row.avgWeight),
    shouldBeWeight: formatDecimalValue(row.shouldBeWeight),
    weightDiff: formatDecimalValue(row.weightDiff),
    grade: row.grade,
    designNo: row.designNo,
    shadeName: row.shadeName,
    beamTakaNo: row.beamTakaNo,
    cut: row.cut,
    sarees: row.sarees,
    remarks: row.remarks,
    sortOrder: row.sortOrder,
  };
}

function toDto(row: TakaReceiveRow): TakaReceiveDto {
  return {
    id: row.id,
    serialNumber: row.serialNumber,
    challanDate: row.challanDate.toISOString(),
    challanNo: row.challanNo,
    partyId: row.partyId,
    partyName: row.party?.name ?? null,
    firmId: row.firmId,
    firmName: row.firm?.name ?? null,
    qualityName: row.qualityName,
    takaPrefix: row.takaPrefix,
    lotNo: row.lotNo,
    withBeam: row.withBeam,
    totalTakas: row.totalTakas,
    totalMeters: formatDecimalValue(row.totalMeters),
    totalWeight: formatDecimalValue(row.totalWeight),
    totalSarees: row.totalSarees,
    originalChallanNo: row.originalChallanNo,
    originalChallanDate: row.originalChallanDate ? row.originalChallanDate.toISOString() : null,
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

export class TakaReceiveJobworkRepository {
  async list(query: TakaReceiveListQuery, tenantId: string): Promise<RepositoryListResult<TakaReceiveDto>> {
    const listQuery = createListQuery(query, [...takaReceiveSearchableFields]);
    const searchWhere = buildSearchWhere([...takaReceiveSearchableFields], query.search);

    const where: Prisma.TakaReceiveJobworkWhereInput = {
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
      prisma.takaReceiveJobwork.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: takaReceiveSelect,
      }),
      prisma.takaReceiveJobwork.count({ where }),
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

  async findById(id: string, tenantId: string): Promise<TakaReceiveDto | null> {
    const row = await prisma.takaReceiveJobwork.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: takaReceiveSelect,
    });
    return row ? toDto(row) : null;
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.takaReceiveJobwork.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.takaReceiveJobwork.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getNextSerialNumber(tenantId: string): Promise<string> {
    const fiscalYear = this.getCurrentFiscalYear();
    const prefix = `TRJ-${fiscalYear}`;
    const last = await prisma.takaReceiveJobwork.findFirst({
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
