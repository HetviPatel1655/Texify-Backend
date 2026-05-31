import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { AppError } from "../common/errors/appError";
import type { BaseCrudService, CreateResult, CrudContext, UpdateResult } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { fiscalYearFromDate } from "../common/utils/fiscal";
import { ChallansRepository } from "./challans.repository";
import type { ChallanDto, ChallanListQuery, CreateChallanDto, UpdateChallanDto } from "./challans.types";

function buildChallanNumber(seriesCode: string, sequenceNumber: number, fiscalYear: string): string {
  return `${seriesCode}-${fiscalYear}-${String(sequenceNumber).padStart(4, "0")}`;
}

export class ChallansService implements BaseCrudService<ChallanDto, CreateChallanDto, UpdateChallanDto, ChallanListQuery> {
  constructor(private readonly challansRepository = new ChallansRepository()) {}

  async list(query: ChallanListQuery): Promise<RepositoryListResult<ChallanDto>> {
    return this.challansRepository.list(query);
  }

  async getById(id: string): Promise<ChallanDto | null> {
    return this.challansRepository.findById(id);
  }

  async create(dto: CreateChallanDto, context?: CrudContext): Promise<CreateResult<ChallanDto>> {
    return prisma.$transaction(async (tx) => {
      const db = tx as any;
      const issueDate = dto.issueDate ?? new Date();
      const fiscalYear = fiscalYearFromDate(issueDate);
      const seriesCode = "CHL";

      const party = await db.party.findFirst({ where: { id: dto.partyId, deletedAt: null }, select: { id: true } });
      if (!party) {
        throw new AppError("Party not found", 404);
      }

      const productIds = dto.items.map((item) => item.productId).filter((value): value is string => Boolean(value));
      if (productIds.length > 0) {
        const products = await db.product.findMany({
          where: { id: { in: productIds }, deletedAt: null },
          select: { id: true }
        });

        if (products.length !== productIds.length) {
          throw new AppError("One or more challan items reference an invalid product", 400);
        }
      }

      const sequenceNumber = await this.challansRepository.nextSequence(seriesCode, fiscalYear, tx);
      const challanNumber = buildChallanNumber(seriesCode, sequenceNumber, fiscalYear);

      const normalizedItems = dto.items.map((item) => {
        const quantity = new Prisma.Decimal(item.quantity);
        const rate = new Prisma.Decimal(item.rate);
        const discountAmount = new Prisma.Decimal(item.discountAmount ?? 0);
        const gstRate = new Prisma.Decimal(item.gstRate ?? 0);
        // subtotal = gross line amount (qty × rate), consistent with invoices
        const subtotal = quantity.mul(rate);
        const taxableAmount = subtotal.minus(discountAmount);
        const gstAmount = taxableAmount.mul(gstRate).div(100);
        const grandTotal = taxableAmount.add(gstAmount);

        return {
          product: item.productId ? { connect: { id: item.productId } } : undefined,
          description: item.description,
          quantity,
          unit: item.unit,
          unitType: item.unitType as never,
          rate,
          discountAmount,
          gstRate,
          taxableAmount,
          gstAmount,
          subtotal,
          grandTotal
        } satisfies Prisma.ChallanItemCreateWithoutChallanInput;
      });

      const totals = normalizedItems.reduce(
        (accumulator, item) => ({
          subtotal: accumulator.subtotal.add(item.subtotal as Prisma.Decimal),
          discountAmount: accumulator.discountAmount.add(item.discountAmount as Prisma.Decimal),
          gstAmount: accumulator.gstAmount.add(item.gstAmount as Prisma.Decimal),
          grandTotal: accumulator.grandTotal.add(item.grandTotal as Prisma.Decimal)
        }),
        {
          subtotal: new Prisma.Decimal(0),
          discountAmount: new Prisma.Decimal(0),
          gstAmount: new Prisma.Decimal(0),
          grandTotal: new Prisma.Decimal(0)
        }
      );

      const challan = await this.challansRepository.create(
        {
          challanNumber,
          seriesCode,
          sequenceNumber,
          fiscalYear,
          issueDate,
          notes: dto.notes ?? null,
          terms: dto.terms ?? null,
          transportMode: dto.transportMode ?? null,
          vehicleNumber: dto.vehicleNumber ?? null,
          placeOfSupply: dto.placeOfSupply ?? null,
          party: { connect: { id: dto.partyId } },
          createdBy: context?.actorId ? { connect: { id: context.actorId } } : undefined,
          updatedBy: context?.actorId ? { connect: { id: context.actorId } } : undefined,
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          gstAmount: totals.gstAmount,
          roundOff: new Prisma.Decimal(0),
          grandTotal: totals.grandTotal
        } as Prisma.ChallanCreateInput,
        normalizedItems,
        db
      );

      return { data: challan };
    });
  }

  async update(id: string, dto: UpdateChallanDto, context?: CrudContext): Promise<UpdateResult<ChallanDto>> {
    const existing = await this.challansRepository.findById(id);

    if (!existing) {
      throw new AppError("Challan not found", 404);
    }

    const challan = await this.challansRepository.update(id, {
      status: dto.status,
      notes: dto.notes ?? undefined,
      terms: dto.terms ?? undefined,
      transportMode: dto.transportMode ?? undefined,
      vehicleNumber: dto.vehicleNumber ?? undefined,
      placeOfSupply: dto.placeOfSupply ?? undefined,
      updatedBy: context?.actorId ? { connect: { id: context.actorId } } : undefined
    } as Prisma.ChallanUpdateInput);

    return { data: challan };
  }

  async remove(id: string): Promise<void> {
    const existing = await this.challansRepository.findById(id);

    if (!existing) {
      throw new AppError("Challan not found", 404);
    }

    await this.challansRepository.softDelete(id);
  }
}