import { Prisma } from "@prisma/client";

import { AppError } from "../common/errors/appError";
import type { BaseCrudService, CreateResult, CrudContext, UpdateResult } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { PartiesRepository } from "./parties.repository";
import type { CreatePartyDto, PartyDto, PartyListQuery, UpdatePartyDto } from "./parties.types";

function normalizePartyCode(code: string | undefined, name: string): string {
  if (code && code.trim().length > 0) {
    return code.trim();
  }

  const prefix = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 8) || "PTY";

  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

export class PartiesService implements BaseCrudService<PartyDto, CreatePartyDto, UpdatePartyDto, PartyListQuery> {
  constructor(private readonly partiesRepository = new PartiesRepository()) {}

  async list(query: PartyListQuery, tenantId: string): Promise<RepositoryListResult<PartyDto>> {
    return this.partiesRepository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<PartyDto | null> {
    return this.partiesRepository.findById(id, tenantId);
  }

  async create(dto: CreatePartyDto, context: CrudContext): Promise<CreateResult<PartyDto>> {
    const party = await this.partiesRepository.create({
      tenant: { connect: { id: context.tenantId } },
      code: normalizePartyCode(dto.code, dto.name),
      name: dto.name,
      partyType: dto.partyType,
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      gstin: dto.gstin ?? null,
      panNo: dto.panNo ?? null,
      billingAddress1: dto.billingAddress1 ?? null,
      billingAddress2: dto.billingAddress2 ?? null,
      billingCity: dto.billingCity ?? null,
      billingState: dto.billingState ?? null,
      billingStateCode: dto.billingStateCode ?? null,
      billingPostalCode: dto.billingPostalCode ?? null,
      billingCountry: dto.billingCountry ?? null,
      shippingAddress1: dto.shippingAddress1 ?? null,
      shippingAddress2: dto.shippingAddress2 ?? null,
      shippingCity: dto.shippingCity ?? null,
      shippingState: dto.shippingState ?? null,
      shippingStateCode: dto.shippingStateCode ?? null,
      shippingPostalCode: dto.shippingPostalCode ?? null,
      shippingCountry: dto.shippingCountry ?? null,
      dueDays: dto.dueDays ?? null,
      isActive: dto.isActive ?? true,
      createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined
    });

    return { data: party };
  }

  async update(id: string, dto: UpdatePartyDto, context: CrudContext): Promise<UpdateResult<PartyDto>> {
    const existing = await this.partiesRepository.findById(id, context.tenantId);

    if (!existing) {
      throw new AppError("Party not found", 404);
    }

    const party = await this.partiesRepository.update(id, context.tenantId, {
      name: dto.name,
      partyType: dto.partyType,
      email: dto.email ?? undefined,
      phone: dto.phone ?? undefined,
      gstin: dto.gstin ?? undefined,
      panNo: dto.panNo ?? undefined,
      billingAddress1: dto.billingAddress1 ?? undefined,
      billingAddress2: dto.billingAddress2 ?? undefined,
      billingCity: dto.billingCity ?? undefined,
      billingState: dto.billingState ?? undefined,
      billingStateCode: dto.billingStateCode ?? undefined,
      billingPostalCode: dto.billingPostalCode ?? undefined,
      billingCountry: dto.billingCountry ?? undefined,
      shippingAddress1: dto.shippingAddress1 ?? undefined,
      shippingAddress2: dto.shippingAddress2 ?? undefined,
      shippingCity: dto.shippingCity ?? undefined,
      shippingState: dto.shippingState ?? undefined,
      shippingStateCode: dto.shippingStateCode ?? undefined,
      shippingPostalCode: dto.shippingPostalCode ?? undefined,
      shippingCountry: dto.shippingCountry ?? undefined,
      dueDays: dto.dueDays !== undefined ? dto.dueDays : undefined,
      isActive: dto.isActive,
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined
    } as Prisma.PartyUpdateInput);

    return { data: party };
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.partiesRepository.findById(id, context.tenantId);

    if (!existing) {
      throw new AppError("Party not found", 404);
    }

    await this.partiesRepository.softDelete(id, context.tenantId);
  }
}
