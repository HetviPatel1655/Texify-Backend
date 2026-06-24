import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { AppError } from "../common/errors/appError";
import type { BaseCrudService, CreateResult, CrudContext, UpdateResult } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { fiscalYearFromDate } from "../common/utils/fiscal";
import { ChallansRepository } from "./challans.repository";
import { CHALLAN_SERIES_CODES, type ChallanType } from "./challans.constants";
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

  async getNextNumber(tenantId: string, challanType: ChallanType = "SALE"): Promise<string> {
    const fiscalYear = fiscalYearFromDate(new Date());
    const seriesCode = CHALLAN_SERIES_CODES[challanType];
    const sequenceNumber = await this.challansRepository.nextSequence(seriesCode, fiscalYear, tenantId);
    return buildChallanNumber(seriesCode, sequenceNumber, fiscalYear);
  }

  async create(dto: CreateChallanDto, context: CrudContext): Promise<CreateResult<ChallanDto>> {
    const tenantId = context.tenantId;
    const challanType: ChallanType = dto.challanType ?? "SALE";
    const seriesCode = CHALLAN_SERIES_CODES[challanType];

    return prisma.$transaction(async (tx) => {
      const db = tx as any;
      const issueDate = dto.issueDate ?? new Date();
      const fiscalYear = fiscalYearFromDate(issueDate);

      const party = await db.party.findFirst({
        where: { id: dto.partyId, tenantId, deletedAt: null },
        select: {
          id: true, name: true,
          shippingAddress1: true, shippingAddress2: true,
          shippingCity: true, shippingState: true, shippingPostalCode: true,
          gstin: true, phone: true
        }
      });
      if (!party) throw new AppError("Party not found", 404);

      let sequenceNumber: number;
      if (dto.sequenceNumber) {
        const exists = await this.challansRepository.numberExists(seriesCode, dto.sequenceNumber, fiscalYear, tenantId, tx);
        if (exists) throw new AppError(`Challan number ${buildChallanNumber(seriesCode, dto.sequenceNumber, fiscalYear)} already exists`, 409);
        sequenceNumber = dto.sequenceNumber;
      } else {
        sequenceNumber = await this.challansRepository.nextSequence(seriesCode, fiscalYear, tenantId, tx);
      }
      const challanNumber = buildChallanNumber(seriesCode, sequenceNumber, fiscalYear);

      const deliveryPartyName = dto.deliveryPartyName ?? party.name;
      const deliveryAddress1 = dto.deliveryAddress1 ?? party.shippingAddress1;
      const deliveryAddress2 = dto.deliveryAddress2 ?? party.shippingAddress2;
      const deliveryCity = dto.deliveryCity ?? party.shippingCity;
      const deliveryState = dto.deliveryState ?? party.shippingState;
      const deliveryPostalCode = dto.deliveryPostalCode ?? party.shippingPostalCode;
      const deliveryGstin = dto.deliveryGstin ?? party.gstin;
      const deliveryPhone = dto.deliveryPhone ?? party.phone;

      const challanData: any = {
        tenant: { connect: { id: tenantId } },
        challanType: challanType as never,
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
        deliveryPartyName, deliveryAddress1, deliveryAddress2,
        deliveryCity, deliveryState, deliveryPostalCode,
        deliveryGstin, deliveryPhone,
        designNo: dto.designNo ?? null,
        dubbleNo: dto.dubbleNo ?? null,
        mobileNo: dto.mobileNo ?? null,
        insideNo: dto.insideNo ?? null,
        dripNo: dto.dripNo ?? null,
        goodsRate: new Prisma.Decimal(dto.goodsRate ?? 0),
        goodsAmount: new Prisma.Decimal(dto.goodsAmount ?? 0),
        party: { connect: { id: dto.partyId } },
        createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
        updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
      };

      if (challanType === "SALE" || challanType === "DIRECT" || challanType === "SAREES") {
        const result = await this.createWithItems(db, dto, challanData, tenantId);
        Object.assign(challanData, result);
      } else if (challanType === "GREY" || challanType === "FINISHED_TAKA") {
        const result = await this.createWithTakas(db, dto, challanData, tenantId, challanType);
        Object.assign(challanData, result);
      } else if (challanType === "BEAM") {
        const result = await this.createWithBeams(db, dto, challanData, tenantId);
        Object.assign(challanData, result);
      } else if (challanType === "YARN_SALE") {
        const result = await this.createWithYarn(db, dto, challanData, tenantId);
        Object.assign(challanData, result);
      }

      const challan = await db.challan.create({
        data: challanData,
        select: { id: true }
      });

      const result = await this.challansRepository.findById(challan.id, tenantId, db);
      return { data: result! };
    });
  }

  private async createWithItems(db: any, dto: CreateChallanDto, challanData: any, tenantId: string) {
    const items = dto.items ?? [];
    if (items.length === 0) throw new AppError("At least one item is required", 400);

    const productIds = items.map((item) => item.productId).filter((v): v is string => Boolean(v));
    const hsnMap = new Map<string, string | null>();
    if (productIds.length > 0) {
      const products = await db.product.findMany({
        where: { id: { in: productIds }, tenantId, deletedAt: null },
        select: { id: true, hsnCode: true }
      });
      if (products.length !== new Set(productIds).size) {
        throw new AppError("One or more items reference an invalid product", 400);
      }
      for (const p of products) hsnMap.set(p.id, p.hsnCode);
    }

    let overallTotalTakas = 0;
    let overallTotalMeters = new Prisma.Decimal(0);

    const normalizedItems = items.map((item, index) => {
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
        quantity, unit: item.unit, unitType: item.unitType as never,
        rate, discountAmount, gstRate, taxableAmount, gstAmount, subtotal, grandTotal,
        sortOrder: index,
        rollEntries: rollEntries.length > 0
          ? { create: rollEntries.map((re) => ({ serialNumber: re.serialNumber, meters: new Prisma.Decimal(re.meters) })) }
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
      { subtotal: new Prisma.Decimal(0), discountAmount: new Prisma.Decimal(0), gstAmount: new Prisma.Decimal(0), grandTotal: new Prisma.Decimal(0) }
    );

    return {
      totalTakas: overallTotalTakas,
      totalMeters: overallTotalMeters,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      gstAmount: totals.gstAmount,
      roundOff: new Prisma.Decimal(0),
      grandTotal: totals.grandTotal,
      items: { create: normalizedItems }
    };
  }

  private async createWithTakas(db: any, dto: CreateChallanDto, challanData: any, tenantId: string, challanType: ChallanType) {
    const entries = dto.takaEntries ?? [];
    if (entries.length === 0) throw new AppError("At least one taka is required", 400);

    const takaIds = entries.map((e) => e.takaId);
    const takas = await db.taka.findMany({
      where: { id: { in: takaIds }, tenantId, deletedAt: null },
      select: { id: true, takaNo: true, itemName: true, loomNo: true, meters: true, weight: true, grade: true, designNo: true, shadeName: true, cut: true, sarees: true, status: true }
    });

    if (takas.length !== new Set(takaIds).size) throw new AppError("One or more takas not found", 400);

    const takaMap = new Map(takas.map((t: any) => [t.id, t]));
    let totalMeters = new Prisma.Decimal(0);
    let totalWeight = new Prisma.Decimal(0);

    const takaCreateData = entries.map((entry, index) => {
      const taka = takaMap.get(entry.takaId) as any;
      totalMeters = totalMeters.add(new Prisma.Decimal(taka.meters));
      totalWeight = totalWeight.add(new Prisma.Decimal(taka.weight));
      return {
        tenant: { connect: { id: tenantId } },
        taka: { connect: { id: entry.takaId } },
        takaNo: taka.takaNo,
        itemName: taka.itemName,
        loomNo: taka.loomNo,
        meters: taka.meters,
        weight: taka.weight,
        grade: taka.grade,
        designNo: taka.designNo,
        shadeName: taka.shadeName,
        cut: taka.cut,
        sarees: taka.sarees,
        sortOrder: index
      };
    });

    const newStatus = challanType === "GREY" ? "SENT_TO_JOBWORK" : "SOLD";
    await db.taka.updateMany({
      where: { id: { in: takaIds }, tenantId },
      data: { status: newStatus }
    });

    return {
      totalTakas: entries.length,
      totalMeters,
      totalWeight,
      totalPcs: entries.length,
      subtotal: new Prisma.Decimal(0),
      discountAmount: new Prisma.Decimal(0),
      gstAmount: new Prisma.Decimal(0),
      roundOff: new Prisma.Decimal(0),
      grandTotal: new Prisma.Decimal(0),
      takaEntries: { create: takaCreateData }
    };
  }

  private async createWithBeams(db: any, dto: CreateChallanDto, challanData: any, tenantId: string) {
    const entries = dto.beamEntries ?? [];
    if (entries.length === 0) throw new AppError("At least one beam is required", 400);

    const beamIds = entries.map((e) => e.beamId);
    const beams = await db.beam.findMany({
      where: { id: { in: beamIds }, tenantId, deletedAt: null },
      select: { id: true, beamNo: true, beamPosition: true, yarnName: true, lotNo: true, ends: true, meters: true, grossWt: true, tareWt: true, netWt: true, pootha: true }
    });

    if (beams.length !== new Set(beamIds).size) throw new AppError("One or more beams not found", 400);

    const beamMap = new Map(beams.map((b: any) => [b.id, b]));
    let totalMeters = new Prisma.Decimal(0);
    let totalWeight = new Prisma.Decimal(0);

    const beamCreateData = entries.map((entry, index) => {
      const beam = beamMap.get(entry.beamId) as any;
      totalMeters = totalMeters.add(new Prisma.Decimal(beam.meters));
      totalWeight = totalWeight.add(new Prisma.Decimal(beam.netWt));
      return {
        tenant: { connect: { id: tenantId } },
        beam: { connect: { id: entry.beamId } },
        beamNo: beam.beamNo,
        beamPosNo: entry.beamPosNo ?? beam.beamPosition ?? null,
        yarnName: beam.yarnName,
        lotNo: beam.lotNo,
        ends: beam.ends,
        meters: beam.meters,
        grossWt: beam.grossWt,
        tareWt: beam.tareWt,
        netWt: beam.netWt,
        pootha: beam.pootha,
        remarks: entry.remarks ?? null,
        sortOrder: index
      };
    });

    return {
      totalTakas: 0,
      totalPcs: entries.length,
      totalMeters,
      totalWeight,
      subtotal: new Prisma.Decimal(0),
      discountAmount: new Prisma.Decimal(0),
      gstAmount: new Prisma.Decimal(0),
      roundOff: new Prisma.Decimal(0),
      grandTotal: new Prisma.Decimal(0),
      beamEntries: { create: beamCreateData }
    };
  }

  private async createWithYarn(db: any, dto: CreateChallanDto, challanData: any, tenantId: string) {
    const entries = dto.yarnEntries ?? [];
    if (entries.length === 0) throw new AppError("At least one yarn carton is required", 400);

    const itemIds = entries.map((e) => e.yarnPurchaseItemId);
    const items = await db.yarnPurchaseItem.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, cartonNo: true, itemName: true, shadeName: true, lotNo: true, denier: true, twist: true, twistDirection: true, cheese: true, grossWt: true, tareWt: true, netWt: true }
    });

    if (items.length !== new Set(itemIds).size) throw new AppError("One or more yarn cartons not found", 400);

    const itemMap = new Map(items.map((i: any) => [i.id, i]));
    let totalWeight = new Prisma.Decimal(0);
    let totalCheese = new Prisma.Decimal(0);

    const yarnCreateData = entries.map((entry, index) => {
      const item = itemMap.get(entry.yarnPurchaseItemId) as any;
      totalWeight = totalWeight.add(new Prisma.Decimal(item.netWt));
      totalCheese = totalCheese.add(new Prisma.Decimal(item.cheese));
      return {
        tenant: { connect: { id: tenantId } },
        yarnPurchaseItem: { connect: { id: entry.yarnPurchaseItemId } },
        cartonNo: item.cartonNo,
        itemName: item.itemName,
        shadeName: item.shadeName,
        lotNo: item.lotNo,
        denier: item.denier,
        twist: item.twist,
        twistDirection: item.twistDirection,
        cheese: item.cheese,
        grossWt: item.grossWt,
        tareWt: item.tareWt,
        netWt: item.netWt,
        remarks: entry.remarks ?? null,
        sortOrder: index
      };
    });

    return {
      totalCartons: entries.length,
      totalWeight,
      totalMeters: new Prisma.Decimal(0),
      subtotal: new Prisma.Decimal(0),
      discountAmount: new Prisma.Decimal(0),
      gstAmount: new Prisma.Decimal(0),
      roundOff: new Prisma.Decimal(0),
      grandTotal: new Prisma.Decimal(0),
      yarnEntries: { create: yarnCreateData }
    };
  }

  async update(id: string, dto: UpdateChallanDto, context: CrudContext): Promise<UpdateResult<ChallanDto>> {
    const tenantId = context.tenantId;
    return prisma.$transaction(async (tx) => {
      const db = tx as any;

      const existing = await this.challansRepository.findById(id, tenantId, db);
      if (!existing) throw new AppError("Challan not found", 404);

      const challanType = existing.challanType as ChallanType;

      const commonUpdate: any = {
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
        designNo: dto.designNo !== undefined ? dto.designNo : undefined,
        dubbleNo: dto.dubbleNo !== undefined ? dto.dubbleNo : undefined,
        mobileNo: dto.mobileNo !== undefined ? dto.mobileNo : undefined,
        insideNo: dto.insideNo !== undefined ? dto.insideNo : undefined,
        dripNo: dto.dripNo !== undefined ? dto.dripNo : undefined,
        goodsRate: dto.goodsRate !== undefined ? new Prisma.Decimal(dto.goodsRate) : undefined,
        goodsAmount: dto.goodsAmount !== undefined ? new Prisma.Decimal(dto.goodsAmount) : undefined,
        status: dto.status,
        updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined
      };

      if (challanType === "SALE" || challanType === "DIRECT" || challanType === "SAREES") {
        if (dto.items) {
          await db.challanItem.deleteMany({ where: { challanId: id } });
          const result = await this.createWithItems(db, { ...dto, items: dto.items } as any, {}, tenantId);
          Object.assign(commonUpdate, result);
        }
      } else if (challanType === "GREY" || challanType === "FINISHED_TAKA") {
        if (dto.takaEntries) {
          const oldEntries = existing.takaEntries;
          if (oldEntries.length > 0) {
            const oldTakaIds = oldEntries.map((e) => e.takaId);
            await db.taka.updateMany({ where: { id: { in: oldTakaIds }, tenantId }, data: { status: "IN_STOCK" } });
          }
          await db.challanTakaEntry.deleteMany({ where: { challanId: id } });
          const result = await this.createWithTakas(db, { ...dto, takaEntries: dto.takaEntries } as any, {}, tenantId, challanType);
          Object.assign(commonUpdate, result);
        }
      } else if (challanType === "BEAM") {
        if (dto.beamEntries) {
          await db.challanBeamEntry.deleteMany({ where: { challanId: id } });
          const result = await this.createWithBeams(db, { ...dto, beamEntries: dto.beamEntries } as any, {}, tenantId);
          Object.assign(commonUpdate, result);
        }
      } else if (challanType === "YARN_SALE") {
        if (dto.yarnEntries) {
          await db.challanYarnEntry.deleteMany({ where: { challanId: id } });
          const result = await this.createWithYarn(db, { ...dto, yarnEntries: dto.yarnEntries } as any, {}, tenantId);
          Object.assign(commonUpdate, result);
        }
      }

      await db.challan.update({ where: { id }, data: commonUpdate });

      const result = await this.challansRepository.findById(id, tenantId, db);
      return { data: result! };
    });
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.challansRepository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Challan not found", 404);

    const challanType = existing.challanType as ChallanType;
    if (challanType === "GREY" || challanType === "FINISHED_TAKA") {
      const takaIds = existing.takaEntries.map((e) => e.takaId);
      if (takaIds.length > 0) {
        await prisma.taka.updateMany({
          where: { id: { in: takaIds }, tenantId: context.tenantId },
          data: { status: "IN_STOCK" }
        });
      }
    }

    await this.challansRepository.softDelete(id, context.tenantId);
  }
}
