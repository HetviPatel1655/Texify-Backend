import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { ChallanDto, ChallanListQuery } from "./challans.types";
import { challanSearchableFields } from "./challans.constants";

const challanSelect = {
  id: true,
  documentType: true,
  challanNumber: true,
  seriesCode: true,
  sequenceNumber: true,
  fiscalYear: true,
  partyId: true,
  status: true,
  issueDate: true,
  notes: true,
  terms: true,
  transportMode: true,
  vehicleNumber: true,
  placeOfSupply: true,
  subtotal: true,
  discountAmount: true,
  gstAmount: true,
  roundOff: true,
  grandTotal: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  items: {
    select: {
      id: true,
      productId: true,
      description: true,
      quantity: true,
      unit: true,
      unitType: true,
      rate: true,
      discountAmount: true,
      gstRate: true,
      taxableAmount: true,
      gstAmount: true,
      subtotal: true,
      grandTotal: true
    }
  }
} as const;

type ChallanRow = Prisma.ChallanGetPayload<{ select: typeof challanSelect }>;

function toChallanDto(row: ChallanRow): ChallanDto {
  return {
    id: row.id,
    documentType: row.documentType,
    challanNumber: row.challanNumber,
    seriesCode: row.seriesCode,
    sequenceNumber: row.sequenceNumber,
    fiscalYear: row.fiscalYear,
    partyId: row.partyId,
    status: row.status,
    issueDate: row.issueDate.toISOString(),
    notes: row.notes,
    terms: row.terms,
    transportMode: row.transportMode,
    vehicleNumber: row.vehicleNumber,
    placeOfSupply: row.placeOfSupply,
    subtotal: formatDecimalValue(row.subtotal),
    discountAmount: formatDecimalValue(row.discountAmount),
    gstAmount: formatDecimalValue(row.gstAmount),
    roundOff: formatDecimalValue(row.roundOff),
    grandTotal: formatDecimalValue(row.grandTotal),
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById,
    updatedById: row.updatedById,
    items: row.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      description: item.description,
      quantity: formatDecimalValue(item.quantity),
      unit: item.unit,
      unitType: item.unitType,
      rate: formatDecimalValue(item.rate),
      discountAmount: formatDecimalValue(item.discountAmount),
      gstRate: formatDecimalValue(item.gstRate),
      taxableAmount: formatDecimalValue(item.taxableAmount),
      gstAmount: formatDecimalValue(item.gstAmount),
      subtotal: formatDecimalValue(item.subtotal),
      grandTotal: formatDecimalValue(item.grandTotal)
    }))
  };
}

export class ChallansRepository {
  async list(query: ChallanListQuery, client: any = prisma): Promise<RepositoryListResult<ChallanDto>> {
    const listQuery = createListQuery(query, [...challanSearchableFields]);
    const searchWhere = buildSearchWhere([...challanSearchableFields], query.search);

    const where: Prisma.ChallanWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.partyId ? { partyId: query.partyId } : {}),
      ...(query.fromDate || query.toDate
        ? {
            issueDate: {
              ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
              ...(query.toDate ? { lte: new Date(query.toDate) } : {})
            }
          }
        : {}),
      ...searchWhere
    };

    const [rows, total] = await Promise.all([
      client.challan.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: challanSelect
      }),
      client.challan.count({ where })
    ]);

    return {
      data: rows.map(toChallanDto),
      meta: {
        page: listQuery.pagination.page,
        limit: listQuery.pagination.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / listQuery.pagination.limit))
      }
    };
  }

  async findById(id: string, client: any = prisma): Promise<ChallanDto | null> {
    const row = await client.challan.findFirst({
      where: { id, deletedAt: null },
      select: challanSelect
    });

    return row ? toChallanDto(row) : null;
  }

  async create(data: Prisma.ChallanCreateInput, items: Prisma.ChallanItemCreateWithoutChallanInput[], client: any = prisma): Promise<ChallanDto> {
    const row = await client.challan.create({
      data: {
        ...data,
        items: { create: items }
      },
      select: challanSelect
    });

    return toChallanDto(row);
  }

  async update(id: string, data: Prisma.ChallanUpdateInput, client: any = prisma): Promise<ChallanDto> {
    const row = await client.challan.update({
      where: { id },
      data,
      select: challanSelect
    });

    return toChallanDto(row);
  }

  async softDelete(id: string, client: any = prisma): Promise<void> {
    await client.challan.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async nextSequence(seriesCode: string, fiscalYear: string, client: any = prisma): Promise<number> {
    const row = await client.challan.findFirst({
      where: { seriesCode, fiscalYear },
      orderBy: { sequenceNumber: "desc" },
      select: { sequenceNumber: true }
    });

    return (row?.sequenceNumber ?? 0) + 1;
  }
}