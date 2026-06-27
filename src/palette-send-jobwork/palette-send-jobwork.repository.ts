import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { PaletteSendDto, PaletteSendListQuery } from "./palette-send-jobwork.types";
import { paletteSendSearchableFields } from "./palette-send-jobwork.constants";

const paletteSendSelect = {
  id: true,
  serialNumber: true,
  challanDate: true,
  challanNo: true,
  partyId: true,
  party: { select: { name: true } },
  paletteNo: true,
  denier: true,
  yarnName: true,
  cheese: true,
  lotNo: true,
  netWt: true,
  amount: true,
  pendingCheese: true,
  issueCheese: true,
  pendingNetWt: true,
  issueNetWt: true,
  remarks: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

type PaletteSendRow = Prisma.PaletteSendJobworkGetPayload<{ select: typeof paletteSendSelect }>;

function toDto(row: PaletteSendRow): PaletteSendDto {
  return {
    id: row.id,
    serialNumber: row.serialNumber,
    challanDate: row.challanDate.toISOString(),
    challanNo: row.challanNo,
    partyId: row.partyId,
    partyName: row.party?.name ?? null,
    paletteNo: row.paletteNo,
    denier: row.denier,
    yarnName: row.yarnName,
    cheese: formatDecimalValue(row.cheese),
    lotNo: row.lotNo,
    netWt: formatDecimalValue(row.netWt),
    amount: formatDecimalValue(row.amount),
    pendingCheese: formatDecimalValue(row.pendingCheese),
    issueCheese: formatDecimalValue(row.issueCheese),
    pendingNetWt: formatDecimalValue(row.pendingNetWt),
    issueNetWt: formatDecimalValue(row.issueNetWt),
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

export class PaletteSendJobworkRepository {
  async list(query: PaletteSendListQuery, tenantId: string): Promise<RepositoryListResult<PaletteSendDto>> {
    const listQuery = createListQuery(query, [...paletteSendSearchableFields]);
    const searchWhere = buildSearchWhere([...paletteSendSearchableFields], query.search);

    const where: Prisma.PaletteSendJobworkWhereInput = {
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
      prisma.paletteSendJobwork.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: paletteSendSelect,
      }),
      prisma.paletteSendJobwork.count({ where }),
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

  async findById(id: string, tenantId: string): Promise<PaletteSendDto | null> {
    const row = await prisma.paletteSendJobwork.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: paletteSendSelect,
    });
    return row ? toDto(row) : null;
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.paletteSendJobwork.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.paletteSendJobwork.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getNextSerialNumber(tenantId: string): Promise<string> {
    const fiscalYear = this.getCurrentFiscalYear();
    const prefix = `PSJ-${fiscalYear}`;
    const last = await prisma.paletteSendJobwork.findFirst({
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
