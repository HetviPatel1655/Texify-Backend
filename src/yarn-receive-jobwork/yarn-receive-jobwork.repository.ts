import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { YarnReceiveDto, YarnReceiveListQuery } from "./yarn-receive-jobwork.types";
import { yarnReceiveSearchableFields } from "./yarn-receive-jobwork.constants";

const yarnReceiveSelect = {
  id: true,
  serialNumber: true,
  challanDate: true,
  challanNo: true,
  partyId: true,
  party: { select: { name: true } },
  yarnName: true,
  shadeName: true,
  emptyRollWt: true,
  lotNo: true,
  denier: true,
  twist: true,
  cages: true,
  rolls: true,
  grossWt: true,
  tareWt: true,
  netWt: true,
  goodsRate: true,
  goodsAmount: true,
  deptName: true,
  originalChallanNo: true,
  originalChallanDate: true,
  remarks: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

type YarnReceiveRow = Prisma.YarnReceiveJobworkGetPayload<{ select: typeof yarnReceiveSelect }>;

function toDto(row: YarnReceiveRow): YarnReceiveDto {
  return {
    id: row.id,
    serialNumber: row.serialNumber,
    challanDate: row.challanDate.toISOString(),
    challanNo: row.challanNo,
    partyId: row.partyId,
    partyName: row.party?.name ?? null,
    yarnName: row.yarnName,
    shadeName: row.shadeName,
    emptyRollWt: formatDecimalValue(row.emptyRollWt),
    lotNo: row.lotNo,
    denier: row.denier,
    twist: row.twist,
    cages: row.cages,
    rolls: row.rolls,
    grossWt: formatDecimalValue(row.grossWt),
    tareWt: formatDecimalValue(row.tareWt),
    netWt: formatDecimalValue(row.netWt),
    goodsRate: formatDecimalValue(row.goodsRate),
    goodsAmount: formatDecimalValue(row.goodsAmount),
    deptName: row.deptName,
    originalChallanNo: row.originalChallanNo,
    originalChallanDate: row.originalChallanDate ? row.originalChallanDate.toISOString() : null,
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

export class YarnReceiveJobworkRepository {
  async list(query: YarnReceiveListQuery, tenantId: string): Promise<RepositoryListResult<YarnReceiveDto>> {
    const listQuery = createListQuery(query, [...yarnReceiveSearchableFields]);
    const searchWhere = buildSearchWhere([...yarnReceiveSearchableFields], query.search);

    const where: Prisma.YarnReceiveJobworkWhereInput = {
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
      prisma.yarnReceiveJobwork.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: yarnReceiveSelect,
      }),
      prisma.yarnReceiveJobwork.count({ where }),
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

  async findById(id: string, tenantId: string): Promise<YarnReceiveDto | null> {
    const row = await prisma.yarnReceiveJobwork.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: yarnReceiveSelect,
    });
    return row ? toDto(row) : null;
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.yarnReceiveJobwork.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.yarnReceiveJobwork.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getNextSerialNumber(tenantId: string): Promise<string> {
    const fiscalYear = this.getCurrentFiscalYear();
    const prefix = `YRJ-${fiscalYear}`;
    const last = await prisma.yarnReceiveJobwork.findFirst({
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
