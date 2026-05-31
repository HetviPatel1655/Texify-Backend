import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createListQuery, type RepositoryListResult } from "../common/repositories/base.repository";
import { buildSearchWhere } from "../common/utils/query";
import { formatDecimalValue } from "../common/utils/decimal";
import type { PartyDto, PartyListQuery } from "./parties.types";
import { partySearchableFields } from "./parties.constants";

const partySelect = {
  id: true,
  code: true,
  name: true,
  partyType: true,
  email: true,
  phone: true,
  gstin: true,
  billingAddress1: true,
  billingAddress2: true,
  billingCity: true,
  billingState: true,
  billingPostalCode: true,
  billingCountry: true,
  shippingAddress1: true,
  shippingAddress2: true,
  shippingCity: true,
  shippingState: true,
  shippingPostalCode: true,
  shippingCountry: true,
  isActive: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } }
} as const;

type PartyRow = Prisma.PartyGetPayload<{ select: typeof partySelect }>;

function toPartyDto(row: PartyRow): PartyDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    partyType: row.partyType,
    email: row.email,
    phone: row.phone,
    gstin: row.gstin,
    billingAddress1: row.billingAddress1,
    billingAddress2: row.billingAddress2,
    billingCity: row.billingCity,
    billingState: row.billingState,
    billingPostalCode: row.billingPostalCode,
    billingCountry: row.billingCountry,
    shippingAddress1: row.shippingAddress1,
    shippingAddress2: row.shippingAddress2,
    shippingCity: row.shippingCity,
    shippingState: row.shippingState,
    shippingPostalCode: row.shippingPostalCode,
    shippingCountry: row.shippingCountry,
    isActive: row.isActive,
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById,
    updatedById: row.updatedById,
    createdByName: row.createdBy?.name ?? null,
    updatedByName: row.updatedBy?.name ?? null
  };
}

export class PartiesRepository {
  async list(query: PartyListQuery): Promise<RepositoryListResult<PartyDto>> {
    const listQuery = createListQuery(query, [...partySearchableFields]);
    const searchWhere = buildSearchWhere([...partySearchableFields], query.search);

    const where: Prisma.PartyWhereInput = {
      deletedAt: null,
      ...(query.partyType ? { partyType: query.partyType } : {}),
      ...(typeof query.isActive === "boolean" ? { isActive: query.isActive } : {}),
      ...searchWhere
    };

    const [rows, total] = await prisma.$transaction([
      prisma.party.findMany({
        where,
        skip: listQuery.pagination.skip,
        take: listQuery.pagination.take,
        orderBy: listQuery.orderBy ?? { createdAt: "desc" },
        select: partySelect
      }),
      prisma.party.count({ where })
    ]);

    return {
      data: rows.map(toPartyDto),
      meta: {
        page: listQuery.pagination.page,
        limit: listQuery.pagination.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / listQuery.pagination.limit))
      }
    };
  }

  async findById(id: string): Promise<PartyDto | null> {
    const row = await prisma.party.findFirst({
      where: { id, deletedAt: null },
      select: partySelect
    });

    return row ? toPartyDto(row) : null;
  }

  async create(data: Prisma.PartyCreateInput): Promise<PartyDto> {
    const row = await prisma.party.create({
      data,
      select: partySelect
    });

    return toPartyDto(row);
  }

  async update(id: string, data: Prisma.PartyUpdateInput): Promise<PartyDto> {
    const row = await prisma.party.update({
      where: { id },
      data,
      select: partySelect
    });

    return toPartyDto(row);
  }

  async softDelete(id: string): Promise<void> {
    await prisma.party.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
    });
  }
}
