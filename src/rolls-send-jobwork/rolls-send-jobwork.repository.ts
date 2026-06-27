import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { RollsSendDto, RollsSendListQuery } from "./rolls-send-jobwork.types";
import { rollsSendSearchableFields } from "./rolls-send-jobwork.constants";

const rollsSendSelect = {
  id: true,
  serialNumber: true,
  challanDate: true,
  challanNo: true,
  partyId: true,
  party: { select: { name: true } },
  yarnName: true,
  lotNo: true,
  cages: true,
  rolls: true,
  grossWt: true,
  tareWt: true,
  netWt: true,
  emptyRollWt: true,
  remarks: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

type RollsSendRow = Prisma.RollsSendJobworkGetPayload<{ select: typeof rollsSendSelect }>;

function toDto(row: RollsSendRow): RollsSendDto {
  return {
    id: row.id,
    serialNumber: row.serialNumber,
    challanDate: row.challanDate.toISOString(),
    challanNo: row.challanNo,
    partyId: row.partyId,
    partyName: row.party?.name ?? null,
    yarnName: row.yarnName,
    lotNo: row.lotNo,
    cages: row.cages,
    rolls: row.rolls,
    grossWt: formatDecimalValue(row.grossWt),
    tareWt: formatDecimalValue(row.tareWt),
    netWt: formatDecimalValue(row.netWt),
    emptyRollWt: formatDecimalValue(row.emptyRollWt),
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

export class RollsSendJobworkRepository {
  async list(query: RollsSendListQuery, tenantId: string): Promise<RepositoryListResult<RollsSendDto>> {
    const listQuery = createListQuery(query, [...rollsSendSearchableFields]);
    const searchWhere = buildSearchWhere([...rollsSendSearchableFields], query.search);

    const where: Prisma.RollsSendJobworkWhereInput = {
      tenantId,
      deletedAt: null,
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
      prisma.rollsSendJobwork.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: rollsSendSelect,
      }),
      prisma.rollsSendJobwork.count({ where }),
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

  async findById(id: string, tenantId: string): Promise<RollsSendDto | null> {
    const row = await prisma.rollsSendJobwork.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: rollsSendSelect,
    });
    return row ? toDto(row) : null;
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.rollsSendJobwork.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.rollsSendJobwork.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getNextSerialNumber(tenantId: string): Promise<string> {
    const fiscalYear = this.getCurrentFiscalYear();
    const prefix = `RSJ-${fiscalYear}`;
    const last = await prisma.rollsSendJobwork.findFirst({
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
