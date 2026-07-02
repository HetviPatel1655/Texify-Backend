import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { YarnIssueDto, YarnIssueListQuery } from "./yarn-issues.types";
import { yarnIssueSearchableFields } from "./yarn-issues.constants";

const yarnIssueSelect = {
  id: true,
  issueDate: true,
  slipNo: true,
  cartonNo: true,
  yarnName: true,
  lotNo: true,
  twistDirection: true,
  cheese: true,
  netWt: true,
  amount: true,
  shadeName: true,
  deptName: true,
  remarks: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

type YarnIssueRow = Prisma.YarnIssueGetPayload<{ select: typeof yarnIssueSelect }>;

function toDto(row: YarnIssueRow): YarnIssueDto {
  return {
    id: row.id,
    issueDate: row.issueDate.toISOString(),
    slipNo: row.slipNo,
    cartonNo: row.cartonNo,
    yarnName: row.yarnName,
    lotNo: row.lotNo,
    twistDirection: row.twistDirection,
    cheese: formatDecimalValue(row.cheese),
    netWt: formatDecimalValue(row.netWt),
    amount: formatDecimalValue(row.amount),
    shadeName: row.shadeName,
    deptName: row.deptName,
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

export class YarnIssuesRepository {
  async list(query: YarnIssueListQuery, tenantId: string): Promise<RepositoryListResult<YarnIssueDto>> {
    const listQuery = createListQuery(query, [...yarnIssueSearchableFields]);
    const searchWhere = buildSearchWhere([...yarnIssueSearchableFields], query.search);

    const where: Prisma.YarnIssueWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.cartonNo ? { cartonNo: query.cartonNo } : {}),
      ...(query.deptName ? { deptName: query.deptName } : {}),
      ...searchWhere,
    };

    const [rows, total] = await prisma.$transaction([
      prisma.yarnIssue.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: yarnIssueSelect,
      }),
      prisma.yarnIssue.count({ where }),
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

  async findById(id: string, tenantId: string): Promise<YarnIssueDto | null> {
    const row = await prisma.yarnIssue.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: yarnIssueSelect,
    });
    return row ? toDto(row) : null;
  }

  async create(data: Prisma.YarnIssueCreateInput): Promise<YarnIssueDto> {
    const row = await prisma.yarnIssue.create({ data, select: yarnIssueSelect });
    return toDto(row);
  }

  async update(id: string, tenantId: string, data: Prisma.YarnIssueUpdateInput): Promise<YarnIssueDto> {
    const existing = await prisma.yarnIssue.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!existing) throw new Error('Yarn issue not found');
    const row = await prisma.yarnIssue.update({ where: { id }, data, select: yarnIssueSelect });
    return toDto(row);
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    const existing = await prisma.yarnIssue.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await prisma.yarnIssue.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getNextSlipNo(tenantId: string): Promise<string> {
    const fiscalYear = this.getCurrentFiscalYear();
    const prefix = `YI-${fiscalYear}`;
    const last = await prisma.yarnIssue.findFirst({
      where: { tenantId, slipNo: { startsWith: prefix } },
      orderBy: { slipNo: "desc" },
      select: { slipNo: true },
    });

    let nextSeq = 1;
    if (last) {
      const parts = last.slipNo.split("-");
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
