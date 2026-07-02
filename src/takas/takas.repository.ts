import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { TakaDto, TakaListQuery } from "./takas.types";
import { takaSearchableFields } from "./takas.constants";

const takaSelect = {
  id: true,
  takaNo: true,
  takaPrefix: true,
  date: true,
  loomNo: true,
  beamId: true,
  beam: { select: { beamNo: true } },
  firmId: true,
  firm: { select: { name: true } },
  itemName: true,
  grade: true,
  designNo: true,
  shadeName: true,
  meters: true,
  weight: true,
  avgWeightPerMeter: true,
  shouldBeWeight: true,
  weightDiff: true,
  sarees: true,
  pieces: true,
  cut: true,
  workerName: true,
  foldingDate: true,
  startingDate: true,
  cuttingDate: true,
  salaryDate: true,
  wtPerMtr: true,
  status: true,
  isWithBeam: true,
  serialNoWiseTaka: true,
  remarks: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

type TakaRow = Prisma.TakaGetPayload<{ select: typeof takaSelect }>;

function toDto(row: TakaRow): TakaDto {
  return {
    id: row.id,
    takaNo: row.takaNo,
    takaPrefix: row.takaPrefix,
    date: row.date.toISOString(),
    loomNo: row.loomNo,
    beamId: row.beamId,
    beamNo: row.beam?.beamNo ?? null,
    firmId: row.firmId,
    firmName: row.firm?.name ?? null,
    itemName: row.itemName,
    grade: row.grade,
    designNo: row.designNo,
    shadeName: row.shadeName,
    meters: formatDecimalValue(row.meters),
    weight: formatDecimalValue(row.weight),
    avgWeightPerMeter: formatDecimalValue(row.avgWeightPerMeter),
    shouldBeWeight: formatDecimalValue(row.shouldBeWeight),
    weightDiff: formatDecimalValue(row.weightDiff),
    sarees: row.sarees,
    pieces: row.pieces,
    cut: row.cut,
    workerName: row.workerName,
    foldingDate: row.foldingDate ? row.foldingDate.toISOString() : null,
    startingDate: row.startingDate ? row.startingDate.toISOString() : null,
    cuttingDate: row.cuttingDate ? row.cuttingDate.toISOString() : null,
    salaryDate: row.salaryDate ? row.salaryDate.toISOString() : null,
    wtPerMtr: formatDecimalValue(row.wtPerMtr),
    status: row.status,
    isWithBeam: row.isWithBeam,
    serialNoWiseTaka: row.serialNoWiseTaka,
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

export class TakasRepository {
  async list(query: TakaListQuery, tenantId: string): Promise<RepositoryListResult<TakaDto>> {
    const listQuery = createListQuery(query, [...takaSearchableFields]);
    const searchWhere = buildSearchWhere([...takaSearchableFields], query.search);

    const dateField = query.dateType === "foldingDate" ? "foldingDate"
      : query.dateType === "startingDate" ? "startingDate"
      : query.dateType === "salaryDate" ? "salaryDate"
      : "date";

    const where: Prisma.TakaWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status ? { status: query.status as any } : {}),
      ...(query.isWithBeam !== undefined ? { isWithBeam: query.isWithBeam === "true" } : {}),
      ...(query.beamId ? { beamId: query.beamId } : {}),
      ...(query.firmId ? { firmId: query.firmId } : {}),
      ...(query.loomNo ? { loomNo: query.loomNo } : {}),
      ...(query.itemName ? { itemName: { contains: query.itemName, mode: "insensitive" } } : {}),
      ...(query.grade ? { grade: query.grade } : {}),
      ...(query.workerName ? { workerName: { contains: query.workerName, mode: "insensitive" } } : {}),
      ...(query.shadeName ? { shadeName: { contains: query.shadeName, mode: "insensitive" } } : {}),
      ...(query.dateFrom || query.dateTo
        ? {
            [dateField]: {
              ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
              ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
            },
          }
        : {}),
      ...searchWhere,
    };

    const [rows, total] = await prisma.$transaction([
      prisma.taka.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: takaSelect,
      }),
      prisma.taka.count({ where }),
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

  async findById(id: string, tenantId: string): Promise<TakaDto | null> {
    const row = await prisma.taka.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: takaSelect,
    });
    return row ? toDto(row) : null;
  }

  async findByTakaNo(takaNo: string, tenantId: string): Promise<TakaDto | null> {
    const row = await prisma.taka.findFirst({
      where: { takaNo, tenantId, deletedAt: null },
      select: takaSelect,
    });
    return row ? toDto(row) : null;
  }

  async create(data: Prisma.TakaCreateInput): Promise<TakaDto> {
    const row = await prisma.taka.create({ data, select: takaSelect });
    return toDto(row);
  }

  async createMany(dataArr: Prisma.TakaCreateInput[]): Promise<TakaDto[]> {
    const results: TakaDto[] = [];
    for (const data of dataArr) {
      const row = await prisma.taka.create({ data, select: takaSelect });
      results.push(toDto(row));
    }
    return results;
  }

  async update(id: string, tenantId: string, data: Prisma.TakaUpdateInput): Promise<TakaDto> {
    const existing = await prisma.taka.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!existing) throw new Error('Taka not found');
    const row = await prisma.taka.update({ where: { id }, data, select: takaSelect });
    return toDto(row);
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.taka.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.taka.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getNextTakaNo(tenantId: string, prefix?: string): Promise<string> {
    const fiscalYear = this.getCurrentFiscalYear();
    const pfx = prefix || "TK";
    const fullPrefix = `${pfx}-${fiscalYear}`;
    const last = await prisma.taka.findFirst({
      where: { tenantId, takaNo: { startsWith: fullPrefix } },
      orderBy: { takaNo: "desc" },
      select: { takaNo: true },
    });

    let nextSeq = 1;
    if (last) {
      const parts = last.takaNo.split("-");
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
    }

    return `${fullPrefix}-${String(nextSeq).padStart(4, "0")}`;
  }

  async getDistinctValues(field: "itemName" | "workerName" | "loomNo" | "grade" | "shadeName" | "designNo", tenantId: string): Promise<string[]> {
    const rows = await prisma.taka.findMany({
      where: { tenantId, deletedAt: null, [field]: { not: null } },
      distinct: [field],
      select: { [field]: true },
      orderBy: { [field]: "asc" },
    });
    return rows.map((r: any) => r[field]).filter(Boolean);
  }

  async getStockSummary(tenantId: string, filters: { dateFrom?: string; dateTo?: string; itemName?: string }): Promise<any[]> {
    const where: Prisma.TakaWhereInput = {
      tenantId,
      deletedAt: null,
      status: "IN_STOCK",
      ...(filters.itemName ? { itemName: { contains: filters.itemName, mode: "insensitive" } } : {}),
      ...(filters.dateFrom || filters.dateTo
        ? {
            date: {
              ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
              ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
            },
          }
        : {}),
    };

    const rows = await prisma.taka.findMany({
      where,
      select: takaSelect,
      orderBy: { date: "desc" },
    });

    return rows.map(toDto);
  }

  private getCurrentFiscalYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
  }
}
