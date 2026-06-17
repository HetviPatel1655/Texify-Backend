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

  async list(query: ChallanListQuery, tenantId: string): Promise<RepositoryListResult<ChallanDto>> {
    return this.challansRepository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<ChallanDto | null> {
    return this.challansRepository.findById(id, tenantId);
  }

  async getNextNumber(tenantId: string): Promise<string> {
    const fiscalYear = fiscalYearFromDate(new Date());
    const seriesCode = "CHL";
    const sequenceNumber = await this.challansRepository.nextSequence(seriesCode, fiscalYear, tenantId);
    return buildChallanNumber(seriesCode, sequenceNumber, fiscalYear);
  }

  async create(dto: CreateChallanDto, context: CrudContext): Promise<CreateResult<ChallanDto>> {
    const tenantId = context.tenantId;
    return prisma.$transaction(async (tx) => {
      const db = tx as any;
      const issueDate = dto.issueDate ?? new Date();
      const fiscalYear = fiscalYearFromDate(issueDate);
      const seriesCode = "CHL";

      const party = await db.party.findFirst({
        where: { id: dto.partyId, tenantId, deletedAt: null },
        select: {
          id: true,
          name: true,
          shippingAddress1: true,
          shippingAddress2: true,
          shippingCity: true,
          shippingState: true,
          shippingPostalCode: true,
          gstin: true,
          phone: true
        }
      });
      if (!party) {
        throw new AppError("Party not found", 404);
      }

      const productIds = dto.items.map((item) => item.productId).filter((value): value is string => Boolean(value));
      if (productIds.length > 0) {
        const products = await db.product.findMany({
          where: { id: { in: productIds }, tenantId, deletedAt: null },
          select: { id: true, hsnCode: true }
        });

        if (products.length !== new Set(productIds).size) {
          throw new AppError("One or more challan items reference an invalid product", 400);
        }
      }

      // Look up hsnCodes for products
      const hsnMap = new Map<string, string | null>();
      if (productIds.length > 0) {
        const products = await db.product.findMany({
          where: { id: { in: productIds }, tenantId },
          select: { id: true, hsnCode: true }
        });
        for (const p of products) {
          hsnMap.set(p.id, p.hsnCode);
        }
      }

      let sequenceNumber: number;
      if (dto.sequenceNumber) {
        const exists = await this.challansRepository.numberExists(seriesCode, dto.sequenceNumber, fiscalYear, tenantId, tx);
        if (exists) {
          throw new AppError(`Challan number ${buildChallanNumber(seriesCode, dto.sequenceNumber, fiscalYear)} already exists`, 409);
        }
        sequenceNumber = dto.sequenceNumber;
      } else {
        sequenceNumber = await this.challansRepository.nextSequence(seriesCode, fiscalYear, tenantId, tx);
      }
      const challanNumber = buildChallanNumber(seriesCode, sequenceNumber, fiscalYear);

      // Auto-fill delivery from party shipping if not provided
      const deliveryPartyName = dto.deliveryPartyName ?? party.name;
      const deliveryAddress1 = dto.deliveryAddress1 ?? party.shippingAddress1;
      const deliveryAddress2 = dto.deliveryAddress2 ?? party.shippingAddress2;
      const deliveryCity = dto.deliveryCity ?? party.shippingCity;
      const deliveryState = dto.deliveryState ?? party.shippingState;
      const deliveryPostalCode = dto.deliveryPostalCode ?? party.shippingPostalCode;
      const deliveryGstin = dto.deliveryGstin ?? party.gstin;
      const deliveryPhone = dto.deliveryPhone ?? party.phone;

      let overallTotalTakas = 0;
      let overallTotalMeters = new Prisma.Decimal(0);

      const normalizedItems = dto.items.map((item, index) => {
        const quantity = new Prisma.Decimal(item.quantity);
        const rate = new Prisma.Decimal(item.rate);
        const discountAmount = new Prisma.Decimal(item.discountAmount ?? 0);
        const gstRate = new Prisma.Decimal(item.gstRate ?? 0);
        const subtotal = quantity.mul(rate);
        const taxableAmount = subtotal.minus(discountAmount);
        const gstAmount = taxableAmount.mul(gstRate).div(100);
        const grandTotal = taxableAmount.add(gstAmount);

        const rollEntries = item.rollEntries ?? [];
        overallTotalTakas += rollEntries.length;
        for (const entry of rollEntries) {
          overallTotalMeters = overallTotalMeters.add(new Prisma.Decimal(entry.meters));
        }

        return {
          product: item.productId ? { connect: { id: item.productId } } : undefined,
          description: item.description,
          hsnCode: item.productId ? (hsnMap.get(item.productId) ?? null) : null,
          quantity,
          unit: item.unit,
          unitType: item.unitType as never,
          rate,
          discountAmount,
          gstRate,
          taxableAmount,
          gstAmount,
          subtotal,
          grandTotal,
          sortOrder: index,
          rollEntries: rollEntries.length > 0
            ? {
                create: rollEntries.map((re) => ({
                  serialNumber: re.serialNumber,
                  meters: new Prisma.Decimal(re.meters)
                }))
              }
            : undefined
        } satisfies Prisma.ChallanItemCreateWithoutChallanInput;
      });

      const totals = normalizedItems.reduce(
        (acc, item) => ({
          subtotal: acc.subtotal.add(item.subtotal as Prisma.Decimal),
          discountAmount: acc.discountAmount.add(item.discountAmount as Prisma.Decimal),
          gstAmount: acc.gstAmount.add(item.gstAmount as Prisma.Decimal),
          grandTotal: acc.grandTotal.add(item.grandTotal as Prisma.Decimal)
        }),
        {
          subtotal: new Prisma.Decimal(0),
          discountAmount: new Prisma.Decimal(0),
          gstAmount: new Prisma.Decimal(0),
          grandTotal: new Prisma.Decimal(0)
        }
      );

      const challan = await db.challan.create({
        data: {
          tenant: { connect: { id: tenantId } },
          challanNumber,
          seriesCode,
          sequenceNumber,
          fiscalYear,
          issueDate,
          agentName: dto.agentName ?? null,
          notes: dto.notes ?? null,
          terms: dto.terms ?? null,
          remark: dto.remark ?? null,
          transportMode: dto.transportMode ?? null,
          vehicleNumber: dto.vehicleNumber ?? null,
          placeOfSupply: dto.placeOfSupply ?? null,
          deliveryPartyName,
          deliveryAddress1,
          deliveryAddress2,
          deliveryCity,
          deliveryState,
          deliveryPostalCode,
          deliveryGstin,
          deliveryPhone,
          totalTakas: overallTotalTakas,
          totalMeters: overallTotalMeters,
          party: { connect: { id: dto.partyId } },
          createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
          updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          gstAmount: totals.gstAmount,
          roundOff: new Prisma.Decimal(0),
          grandTotal: totals.grandTotal,
          items: { create: normalizedItems }
        },
        select: { id: true }
      });

      const result = await this.challansRepository.findById(challan.id, tenantId, db);
      return { data: result! };
    });
  }

  async update(id: string, dto: UpdateChallanDto, context: CrudContext): Promise<UpdateResult<ChallanDto>> {
    const tenantId = context.tenantId;
    return prisma.$transaction(async (tx) => {
      const db = tx as any;

      const existing = await this.challansRepository.findById(id, tenantId, db);
      if (!existing) {
        throw new AppError("Challan not found", 404);
      }

      if (dto.items) {
        // Delete existing items (cascade deletes roll entries)
        await db.challanItem.deleteMany({ where: { challanId: id } });

        // Look up hsnCodes
        const productIds = dto.items.map((i) => i.productId).filter((v): v is string => Boolean(v));
        const hsnMap = new Map<string, string | null>();
        if (productIds.length > 0) {
          const products = await db.product.findMany({
            where: { id: { in: productIds }, tenantId },
            select: { id: true, hsnCode: true }
          });
          for (const p of products) {
            hsnMap.set(p.id, p.hsnCode);
          }
        }

        let overallTotalTakas = 0;
        let overallTotalMeters = new Prisma.Decimal(0);

        const normalizedItems = dto.items.map((item, index) => {
          const quantity = new Prisma.Decimal(item.quantity);
          const rate = new Prisma.Decimal(item.rate);
          const discountAmount = new Prisma.Decimal(item.discountAmount ?? 0);
          const gstRate = new Prisma.Decimal(item.gstRate ?? 0);
          const subtotal = quantity.mul(rate);
          const taxableAmount = subtotal.minus(discountAmount);
          const gstAmount = taxableAmount.mul(gstRate).div(100);
          const grandTotal = taxableAmount.add(gstAmount);

          const rollEntries = item.rollEntries ?? [];
          overallTotalTakas += rollEntries.length;
          for (const entry of rollEntries) {
            overallTotalMeters = overallTotalMeters.add(new Prisma.Decimal(entry.meters));
          }

          return {
            product: item.productId ? { connect: { id: item.productId } } : undefined,
            description: item.description,
            hsnCode: item.productId ? (hsnMap.get(item.productId) ?? null) : null,
            quantity,
            unit: item.unit,
            unitType: item.unitType as never,
            rate,
            discountAmount,
            gstRate,
            taxableAmount,
            gstAmount,
            subtotal,
            grandTotal,
            sortOrder: index,
            rollEntries: rollEntries.length > 0
              ? {
                  create: rollEntries.map((re) => ({
                    serialNumber: re.serialNumber,
                    meters: new Prisma.Decimal(re.meters)
                  }))
                }
              : undefined
          } satisfies Prisma.ChallanItemCreateWithoutChallanInput;
        });

        const totals = normalizedItems.reduce(
          (acc, item) => ({
            subtotal: acc.subtotal.add(item.subtotal as Prisma.Decimal),
            discountAmount: acc.discountAmount.add(item.discountAmount as Prisma.Decimal),
            gstAmount: acc.gstAmount.add(item.gstAmount as Prisma.Decimal),
            grandTotal: acc.grandTotal.add(item.grandTotal as Prisma.Decimal)
          }),
          {
            subtotal: new Prisma.Decimal(0),
            discountAmount: new Prisma.Decimal(0),
            gstAmount: new Prisma.Decimal(0),
            grandTotal: new Prisma.Decimal(0)
          }
        );

        await db.challan.update({
          where: { id },
          data: {
            agentName: dto.agentName !== undefined ? dto.agentName : undefined,
            notes: dto.notes !== undefined ? dto.notes : undefined,
            terms: dto.terms !== undefined ? dto.terms : undefined,
            remark: dto.remark !== undefined ? dto.remark : undefined,
            transportMode: dto.transportMode !== undefined ? dto.transportMode : undefined,
            vehicleNumber: dto.vehicleNumber !== undefined ? dto.vehicleNumber : undefined,
            placeOfSupply: dto.placeOfSupply !== undefined ? dto.placeOfSupply : undefined,
            deliveryPartyName: dto.deliveryPartyName !== undefined ? dto.deliveryPartyName : undefined,
            deliveryAddress1: dto.deliveryAddress1 !== undefined ? dto.deliveryAddress1 : undefined,
            deliveryAddress2: dto.deliveryAddress2 !== undefined ? dto.deliveryAddress2 : undefined,
            deliveryCity: dto.deliveryCity !== undefined ? dto.deliveryCity : undefined,
            deliveryState: dto.deliveryState !== undefined ? dto.deliveryState : undefined,
            deliveryPostalCode: dto.deliveryPostalCode !== undefined ? dto.deliveryPostalCode : undefined,
            deliveryGstin: dto.deliveryGstin !== undefined ? dto.deliveryGstin : undefined,
            deliveryPhone: dto.deliveryPhone !== undefined ? dto.deliveryPhone : undefined,
            status: dto.status,
            totalTakas: overallTotalTakas,
            totalMeters: overallTotalMeters,
            subtotal: totals.subtotal,
            discountAmount: totals.discountAmount,
            gstAmount: totals.gstAmount,
            grandTotal: totals.grandTotal,
            updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
            items: { create: normalizedItems }
          }
        });
      } else {
        await db.challan.update({
          where: { id },
          data: {
            status: dto.status,
            agentName: dto.agentName !== undefined ? dto.agentName : undefined,
            notes: dto.notes !== undefined ? dto.notes : undefined,
            terms: dto.terms !== undefined ? dto.terms : undefined,
            remark: dto.remark !== undefined ? dto.remark : undefined,
            transportMode: dto.transportMode !== undefined ? dto.transportMode : undefined,
            vehicleNumber: dto.vehicleNumber !== undefined ? dto.vehicleNumber : undefined,
            placeOfSupply: dto.placeOfSupply !== undefined ? dto.placeOfSupply : undefined,
            deliveryPartyName: dto.deliveryPartyName !== undefined ? dto.deliveryPartyName : undefined,
            deliveryAddress1: dto.deliveryAddress1 !== undefined ? dto.deliveryAddress1 : undefined,
            deliveryAddress2: dto.deliveryAddress2 !== undefined ? dto.deliveryAddress2 : undefined,
            deliveryCity: dto.deliveryCity !== undefined ? dto.deliveryCity : undefined,
            deliveryState: dto.deliveryState !== undefined ? dto.deliveryState : undefined,
            deliveryPostalCode: dto.deliveryPostalCode !== undefined ? dto.deliveryPostalCode : undefined,
            deliveryGstin: dto.deliveryGstin !== undefined ? dto.deliveryGstin : undefined,
            deliveryPhone: dto.deliveryPhone !== undefined ? dto.deliveryPhone : undefined,
            updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined
          }
        });
      }

      const result = await this.challansRepository.findById(id, tenantId, db);
      return { data: result! };
    });
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.challansRepository.findById(id, context.tenantId);

    if (!existing) {
      throw new AppError("Challan not found", 404);
    }

    await this.challansRepository.softDelete(id, context.tenantId);
  }
}
