import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository.js";
import { buildSearchWhere } from "../common/utils/query.js";
import { formatDecimalValue } from "../common/utils/decimal.js";
import type { BeamSendDto, BeamSendItemDto, BeamSendListQuery } from "./beam-send-jobwork.types.js";
import { beamSendSearchableFields } from "./beam-send-jobwork.constants.js";

const itemSelect = {
  id: true,
  beamId: true,
  beamNo: true,
  yarnName: true,
  lotNo: true,
  ends: true,
  takas: true,
  meters: true,
  grossWt: true,
  tareWt: true,
  netWt: true,
  pootha: true,
  remarks: true,
  sortOrder: true,
} as const;

const beamSendSelect = {
  id: true,
  serialNumber: true,
  challanDate: true,
  challanNo: true,
  firmId: true,
  firm: { select: { name: true } },
  partyId: true,
  party: { select: { name: true } },
  totalBeamPipes: true,
  totalTakas: true,
  totalMeters: true,
  totalGrossWt: true,
  totalTareWt: true,
  totalNetWt: true,
  totalPootha: true,
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

type BeamSendRow = Prisma.BeamSendJobworkGetPayload<{ select: typeof beamSendSelect }>;

function itemToDto(row: any): BeamSendItemDto {
  return {
    id: row.id,
    beamId: row.beamId,
    beamNo: row.beamNo,
    yarnName: row.yarnName,
    lotNo: row.lotNo,
    ends: row.ends,
    takas: formatDecimalValue(row.takas),
    meters: formatDecimalValue(row.meters),
    grossWt: formatDecimalValue(row.grossWt),
    tareWt: formatDecimalValue(row.tareWt),
    netWt: formatDecimalValue(row.netWt),
    pootha: formatDecimalValue(row.pootha),
    remarks: row.remarks,
    sortOrder: row.sortOrder,
  };
}

function toDto(row: BeamSendRow): BeamSendDto {
  return {
    id: row.id,
    serialNumber: row.serialNumber,
    challanDate: row.challanDate.toISOString(),
    challanNo: row.challanNo,
    firmId: row.firmId,
    firmName: row.firm?.name ?? null,
    partyId: row.partyId,
    partyName: row.party?.name ?? null,
    totalBeamPipes: row.totalBeamPipes,
    totalTakas: formatDecimalValue(row.totalTakas),
    totalMeters: formatDecimalValue(row.totalMeters),
    totalGrossWt: formatDecimalValue(row.totalGrossWt),
    totalTareWt: formatDecimalValue(row.totalTareWt),
    totalNetWt: formatDecimalValue(row.totalNetWt),
    totalPootha: formatDecimalValue(row.totalPootha),
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

export class BeamSendJobworkRepository {
  async list(query: BeamSendListQuery, tenantId: string): Promise<RepositoryListResult<BeamSendDto>> {
    const listQuery = createListQuery(query, [...beamSendSearchableFields]);
    const searchWhere = buildSearchWhere([...beamSendSearchableFields], query.search);

    const where: Prisma.BeamSendJobworkWhereInput = {
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
      prisma.beamSendJobwork.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: beamSendSelect,
      }),
      prisma.beamSendJobwork.count({ where }),
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

  async findById(id: string, tenantId: string): Promise<BeamSendDto | null> {
    const row = await prisma.beamSendJobwork.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: beamSendSelect,
    });
    return row ? toDto(row) : null;
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.beamSendJobwork.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.beamSendJobwork.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getNextSerialNumber(tenantId: string): Promise<string> {
    const fiscalYear = this.getCurrentFiscalYear();
    const prefix = `BSJ-${fiscalYear}`;
    const last = await prisma.beamSendJobwork.findFirst({
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
