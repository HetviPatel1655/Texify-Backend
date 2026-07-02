import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { BeamDto, BeamListQuery } from "./beams.types";
import { beamSearchableFields } from "./beams.constants";

const beamSelect = {
  id: true,
  beamNo: true,
  beamDate: true,
  beamPipeNo: true,
  itemName: true,
  yarnName: true,
  lotNo: true,
  ends: true,
  takas: true,
  meters: true,
  grossWt: true,
  tareWt: true,
  netWt: true,
  pootha: true,
  beamPosition: true,
  plannedMeters: true,
  plannedTakas: true,
  shortPercent: true,
  bhiran: true,
  status: true,
  partyId: true,
  party: { select: { name: true } },
  warperName: true,
  loomNo: true,
  remarks: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

type BeamRow = Prisma.BeamGetPayload<{ select: typeof beamSelect }>;

function toDto(row: BeamRow): BeamDto {
  return {
    id: row.id,
    beamNo: row.beamNo,
    beamDate: row.beamDate.toISOString(),
    beamPipeNo: row.beamPipeNo,
    itemName: row.itemName,
    yarnName: row.yarnName,
    lotNo: row.lotNo,
    ends: row.ends,
    takas: formatDecimalValue(row.takas),
    meters: formatDecimalValue(row.meters),
    grossWt: formatDecimalValue(row.grossWt),
    tareWt: formatDecimalValue(row.tareWt),
    netWt: formatDecimalValue(row.netWt),
    pootha: formatDecimalValue(row.pootha),
    beamPosition: row.beamPosition,
    plannedMeters: formatDecimalValue(row.plannedMeters),
    plannedTakas: formatDecimalValue(row.plannedTakas),
    shortPercent: formatDecimalValue(row.shortPercent),
    bhiran: formatDecimalValue(row.bhiran),
    status: row.status,
    partyId: row.partyId,
    partyName: row.party?.name ?? null,
    warperName: row.warperName,
    loomNo: row.loomNo,
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

export class BeamsRepository {
  async list(query: BeamListQuery, tenantId: string): Promise<RepositoryListResult<BeamDto>> {
    const listQuery = createListQuery(query, [...beamSearchableFields]);
    const searchWhere = buildSearchWhere([...beamSearchableFields], query.search);

    const where: Prisma.BeamWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status ? { status: query.status as any } : {}),
      ...(query.partyId ? { partyId: query.partyId } : {}),
      ...(query.itemName ? { itemName: { contains: query.itemName, mode: "insensitive" } } : {}),
      ...(query.warperName ? { warperName: { contains: query.warperName, mode: "insensitive" } } : {}),
      ...(query.loomNo ? { loomNo: query.loomNo } : {}),
      ...(query.beamPipeNo ? { beamPipeNo: query.beamPipeNo } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            beamDate: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
      ...searchWhere,
    };

    const [rows, total] = await prisma.$transaction([
      prisma.beam.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: beamSelect,
      }),
      prisma.beam.count({ where }),
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

  async findById(id: string, tenantId: string): Promise<BeamDto | null> {
    const row = await prisma.beam.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: beamSelect,
    });
    return row ? toDto(row) : null;
  }

  async create(data: Prisma.BeamCreateInput): Promise<BeamDto> {
    const row = await prisma.beam.create({ data, select: beamSelect });
    return toDto(row);
  }

  async update(id: string, tenantId: string, data: Prisma.BeamUpdateInput): Promise<BeamDto> {
    const existing = await prisma.beam.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!existing) throw new Error('Beam not found');
    const row = await prisma.beam.update({ where: { id }, data, select: beamSelect });
    return toDto(row);
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.beam.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.beam.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getNextBeamNo(tenantId: string): Promise<string> {
    const fiscalYear = this.getCurrentFiscalYear();
    const prefix = `BM-${fiscalYear}`;
    const last = await prisma.beam.findFirst({
      where: { tenantId, beamNo: { startsWith: prefix } },
      orderBy: { beamNo: "desc" },
      select: { beamNo: true },
    });

    let nextSeq = 1;
    if (last) {
      const parts = last.beamNo.split("-");
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
    }

    return `${prefix}-${String(nextSeq).padStart(4, "0")}`;
  }

  async getDistinctValues(field: "itemName" | "warperName" | "loomNo", tenantId: string): Promise<string[]> {
    const rows = await prisma.beam.findMany({
      where: { tenantId, deletedAt: null, [field]: { not: null } },
      distinct: [field],
      select: { [field]: true },
      orderBy: { [field]: "asc" },
    });
    return rows.map((r: any) => r[field]).filter(Boolean);
  }

  private getCurrentFiscalYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
  }
}
