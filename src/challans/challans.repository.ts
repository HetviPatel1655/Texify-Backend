import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { ChallanDto, ChallanItemDto, ChallanListQuery, ChallanPartyDto, ChallanRollEntryDto } from "./challans.types";
import { challanSearchableFields } from "./challans.constants";

const challanPartySelect = {
  id: true,
  code: true,
  name: true,
  partyType: true,
  gstin: true,
  phone: true,
  billingAddress1: true,
  billingAddress2: true,
  billingCity: true,
  billingState: true,
  billingStateCode: true,
  billingPostalCode: true,
  shippingAddress1: true,
  shippingAddress2: true,
  shippingCity: true,
  shippingState: true,
  shippingStateCode: true,
  shippingPostalCode: true
} as const;

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
  agentName: true,
  notes: true,
  terms: true,
  remark: true,
  transportMode: true,
  vehicleNumber: true,
  placeOfSupply: true,
  deliveryPartyName: true,
  deliveryAddress1: true,
  deliveryAddress2: true,
  deliveryCity: true,
  deliveryState: true,
  deliveryPostalCode: true,
  deliveryGstin: true,
  deliveryPhone: true,
  totalTakas: true,
  totalMeters: true,
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
  party: { select: challanPartySelect },
  items: {
    select: {
      id: true,
      productId: true,
      description: true,
      hsnCode: true,
      quantity: true,
      unit: true,
      unitType: true,
      rate: true,
      discountAmount: true,
      gstRate: true,
      taxableAmount: true,
      gstAmount: true,
      subtotal: true,
      grandTotal: true,
      sortOrder: true,
      product: {
        select: {
          id: true,
          sku: true,
          name: true,
          hsnCode: true,
          unitType: true
        }
      },
      rollEntries: {
        select: {
          id: true,
          serialNumber: true,
          meters: true
        },
        orderBy: { serialNumber: "asc" as const }
      }
    },
    orderBy: { sortOrder: "asc" as const }
  }
} as const;

type ChallanRow = Prisma.ChallanGetPayload<{ select: typeof challanSelect }>;

function toPartyDto(row: ChallanRow["party"]): ChallanPartyDto | null {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    partyType: row.partyType,
    gstin: row.gstin,
    phone: row.phone,
    billingAddress1: row.billingAddress1,
    billingAddress2: row.billingAddress2,
    billingCity: row.billingCity,
    billingState: row.billingState,
    billingStateCode: row.billingStateCode,
    billingPostalCode: row.billingPostalCode,
    shippingAddress1: row.shippingAddress1,
    shippingAddress2: row.shippingAddress2,
    shippingCity: row.shippingCity,
    shippingState: row.shippingState,
    shippingStateCode: row.shippingStateCode,
    shippingPostalCode: row.shippingPostalCode
  };
}

function toRollEntryDto(entry: ChallanRow["items"][number]["rollEntries"][number]): ChallanRollEntryDto {
  return {
    id: entry.id,
    serialNumber: entry.serialNumber,
    meters: formatDecimalValue(entry.meters)
  };
}

function toItemDto(item: ChallanRow["items"][number]): ChallanItemDto {
  return {
    id: item.id,
    productId: item.productId,
    description: item.description,
    hsnCode: item.hsnCode,
    quantity: formatDecimalValue(item.quantity),
    unit: item.unit,
    unitType: item.unitType,
    rate: formatDecimalValue(item.rate),
    discountAmount: formatDecimalValue(item.discountAmount),
    gstRate: formatDecimalValue(item.gstRate),
    taxableAmount: formatDecimalValue(item.taxableAmount),
    gstAmount: formatDecimalValue(item.gstAmount),
    subtotal: formatDecimalValue(item.subtotal),
    grandTotal: formatDecimalValue(item.grandTotal),
    sortOrder: item.sortOrder,
    rollEntries: item.rollEntries.map(toRollEntryDto),
    product: item.product ? {
      id: item.product.id,
      sku: item.product.sku,
      name: item.product.name,
      hsnCode: item.product.hsnCode,
      unitType: item.product.unitType
    } : null
  };
}

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
    agentName: row.agentName,
    notes: row.notes,
    terms: row.terms,
    remark: row.remark,
    transportMode: row.transportMode,
    vehicleNumber: row.vehicleNumber,
    placeOfSupply: row.placeOfSupply,
    deliveryPartyName: row.deliveryPartyName,
    deliveryAddress1: row.deliveryAddress1,
    deliveryAddress2: row.deliveryAddress2,
    deliveryCity: row.deliveryCity,
    deliveryState: row.deliveryState,
    deliveryPostalCode: row.deliveryPostalCode,
    deliveryGstin: row.deliveryGstin,
    deliveryPhone: row.deliveryPhone,
    totalTakas: row.totalTakas,
    totalMeters: formatDecimalValue(row.totalMeters),
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
    party: toPartyDto(row.party),
    items: row.items.map(toItemDto)
  };
}

export class ChallansRepository {
  async list(query: ChallanListQuery, tenantId: string, client: any = prisma): Promise<RepositoryListResult<ChallanDto>> {
    const listQuery = createListQuery(query, [...challanSearchableFields]);
    const searchWhere = buildSearchWhere([...challanSearchableFields], query.search);

    const where: Prisma.ChallanWhereInput = {
      tenantId,
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

  async findById(id: string, tenantId: string, client: any = prisma): Promise<ChallanDto | null> {
    const row = await client.challan.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: challanSelect
    });

    return row ? toChallanDto(row) : null;
  }

  async softDelete(id: string, tenantId: string, client: any = prisma): Promise<void> {
    const existing = await client.challan.findFirst({ where: { id, tenantId } });
    if (!existing) return;
    await client.challan.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async nextSequence(seriesCode: string, fiscalYear: string, tenantId: string, client: any = prisma): Promise<number> {
    const row = await client.challan.findFirst({
      where: { seriesCode, fiscalYear, tenantId },
      orderBy: { sequenceNumber: "desc" },
      select: { sequenceNumber: true }
    });

    return (row?.sequenceNumber ?? 0) + 1;
  }

  async numberExists(seriesCode: string, sequenceNumber: number, fiscalYear: string, tenantId: string, client: any = prisma): Promise<boolean> {
    const row = await client.challan.findFirst({
      where: { seriesCode, sequenceNumber, fiscalYear, tenantId, deletedAt: null },
      select: { id: true }
    });

    return row !== null;
  }
}
