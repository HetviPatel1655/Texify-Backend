import { prisma } from "../lib/prisma";
import { AppError } from "../common/errors/appError";
import type { CrudContext } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { formatDecimalValue } from "../common/utils/decimal";
import { TakaReceiveJobworkRepository } from "./taka-receive-jobwork.repository";
import type {
  CreateTakaReceiveDto,
  TakaReceiveDto,
  TakaReceiveItemDto,
  TakaReceiveListQuery,
  UpdateTakaReceiveDto,
} from "./taka-receive-jobwork.types";

const itemSelect = {
  id: true,
  takaNo: true,
  loomNo: true,
  meters: true,
  weight: true,
  itemName: true,
  avgWeight: true,
  shouldBeWeight: true,
  weightDiff: true,
  grade: true,
  designNo: true,
  shadeName: true,
  beamTakaNo: true,
  cut: true,
  sarees: true,
  remarks: true,
  sortOrder: true,
} as const;

const takaReceiveSelect = {
  id: true,
  serialNumber: true,
  challanDate: true,
  challanNo: true,
  partyId: true,
  party: { select: { name: true } },
  firmId: true,
  firm: { select: { name: true } },
  qualityName: true,
  takaPrefix: true,
  lotNo: true,
  withBeam: true,
  totalTakas: true,
  totalMeters: true,
  totalWeight: true,
  totalSarees: true,
  originalChallanNo: true,
  originalChallanDate: true,
  goodsRate: true,
  goodsAmount: true,
  remarks: true,
  items: { select: itemSelect, orderBy: { sortOrder: "asc" as const } },
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

function itemToDto(row: any): TakaReceiveItemDto {
  return {
    id: row.id,
    takaNo: row.takaNo,
    loomNo: row.loomNo,
    meters: formatDecimalValue(row.meters),
    weight: formatDecimalValue(row.weight),
    itemName: row.itemName,
    avgWeight: formatDecimalValue(row.avgWeight),
    shouldBeWeight: formatDecimalValue(row.shouldBeWeight),
    weightDiff: formatDecimalValue(row.weightDiff),
    grade: row.grade,
    designNo: row.designNo,
    shadeName: row.shadeName,
    beamTakaNo: row.beamTakaNo,
    cut: row.cut,
    sarees: row.sarees,
    remarks: row.remarks,
    sortOrder: row.sortOrder,
  };
}

function rowToDto(row: any): TakaReceiveDto {
  return {
    id: row.id,
    serialNumber: row.serialNumber,
    challanDate: row.challanDate.toISOString(),
    challanNo: row.challanNo,
    partyId: row.partyId,
    partyName: row.party?.name ?? null,
    firmId: row.firmId,
    firmName: row.firm?.name ?? null,
    qualityName: row.qualityName,
    takaPrefix: row.takaPrefix,
    lotNo: row.lotNo,
    withBeam: row.withBeam,
    totalTakas: row.totalTakas,
    totalMeters: formatDecimalValue(row.totalMeters),
    totalWeight: formatDecimalValue(row.totalWeight),
    totalSarees: row.totalSarees,
    originalChallanNo: row.originalChallanNo,
    originalChallanDate: row.originalChallanDate ? row.originalChallanDate.toISOString() : null,
    goodsRate: formatDecimalValue(row.goodsRate),
    goodsAmount: formatDecimalValue(row.goodsAmount),
    remarks: row.remarks,
    items: row.items.map(itemToDto),
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById,
    updatedById: row.updatedById,
    createdByName: row.createdBy?.name ?? null,
    updatedByName: row.updatedBy?.name ?? null,
  };
}

export class TakaReceiveJobworkService {
  constructor(private readonly repository = new TakaReceiveJobworkRepository()) {}

  async list(query: TakaReceiveListQuery, tenantId: string): Promise<RepositoryListResult<TakaReceiveDto>> {
    return this.repository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<TakaReceiveDto | null> {
    return this.repository.findById(id, tenantId);
  }

  async getNextSerialNumber(tenantId: string): Promise<string> {
    return this.repository.getNextSerialNumber(tenantId);
  }

  async create(dto: CreateTakaReceiveDto, context: CrudContext): Promise<{ data: TakaReceiveDto }> {
    const serialNumber = await this.repository.getNextSerialNumber(context.tenantId);

    let totalMeters = 0, totalWeight = 0, totalSarees = 0;
    for (const item of dto.items) {
      totalMeters += item.meters ?? 0;
      totalWeight += item.weight ?? 0;
      totalSarees += item.sarees ?? 0;
    }

    const row = await prisma.takaReceiveJobwork.create({
      data: {
        tenant: { connect: { id: context.tenantId } },
        serialNumber,
        challanDate: dto.challanDate ? new Date(dto.challanDate) : new Date(),
        challanNo: dto.challanNo ?? null,
        party: dto.partyId ? { connect: { id: dto.partyId } } : undefined,
        firm: dto.firmId ? { connect: { id: dto.firmId } } : undefined,
        qualityName: dto.qualityName ?? null,
        takaPrefix: dto.takaPrefix ?? null,
        lotNo: dto.lotNo ?? null,
        withBeam: dto.withBeam ?? false,
        totalTakas: dto.items.length,
        totalMeters,
        totalWeight,
        totalSarees,
        originalChallanNo: dto.originalChallanNo ?? null,
        originalChallanDate: dto.originalChallanDate ? new Date(dto.originalChallanDate) : null,
        goodsRate: dto.goodsRate ?? 0,
        goodsAmount: dto.goodsAmount ?? 0,
        remarks: dto.remarks ?? null,
        createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
        updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
        items: {
          create: dto.items.map((it, idx) => ({
            takaNo: it.takaNo,
            loomNo: it.loomNo ?? null,
            meters: it.meters ?? 0,
            weight: it.weight ?? 0,
            itemName: it.itemName ?? null,
            avgWeight: it.avgWeight ?? 0,
            shouldBeWeight: it.shouldBeWeight ?? 0,
            weightDiff: it.weightDiff ?? 0,
            grade: it.grade ?? null,
            designNo: it.designNo ?? null,
            shadeName: it.shadeName ?? null,
            beamTakaNo: it.beamTakaNo ?? null,
            cut: it.cut ?? null,
            sarees: it.sarees ?? 0,
            remarks: it.remarks ?? null,
            sortOrder: idx,
          })),
        },
      },
      select: takaReceiveSelect,
    });

    return { data: rowToDto(row) };
  }

  async update(id: string, dto: UpdateTakaReceiveDto, context: CrudContext): Promise<{ data: TakaReceiveDto }> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Taka receive jobwork not found", 404);

    const updateData: any = {
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    };

    if (dto.challanDate) updateData.challanDate = new Date(dto.challanDate);
    if (dto.challanNo !== undefined) updateData.challanNo = dto.challanNo;
    if (dto.qualityName !== undefined) updateData.qualityName = dto.qualityName;
    if (dto.takaPrefix !== undefined) updateData.takaPrefix = dto.takaPrefix;
    if (dto.lotNo !== undefined) updateData.lotNo = dto.lotNo;
    if (dto.withBeam !== undefined) updateData.withBeam = dto.withBeam;
    if (dto.originalChallanNo !== undefined) updateData.originalChallanNo = dto.originalChallanNo;
    if (dto.originalChallanDate !== undefined) {
      updateData.originalChallanDate = dto.originalChallanDate ? new Date(dto.originalChallanDate) : null;
    }
    if (dto.goodsRate !== undefined) updateData.goodsRate = dto.goodsRate;
    if (dto.goodsAmount !== undefined) updateData.goodsAmount = dto.goodsAmount;
    if (dto.remarks !== undefined) updateData.remarks = dto.remarks;

    if (dto.firmId !== undefined) {
      updateData.firm = dto.firmId ? { connect: { id: dto.firmId } } : { disconnect: true };
    }
    if (dto.partyId !== undefined) {
      updateData.party = dto.partyId ? { connect: { id: dto.partyId } } : { disconnect: true };
    }

    if (dto.items) {
      let totalMeters = 0, totalWeight = 0, totalSarees = 0;
      for (const item of dto.items) {
        totalMeters += item.meters ?? 0;
        totalWeight += item.weight ?? 0;
        totalSarees += item.sarees ?? 0;
      }

      updateData.totalTakas = dto.items.length;
      updateData.totalMeters = totalMeters;
      updateData.totalWeight = totalWeight;
      updateData.totalSarees = totalSarees;

      updateData.items = {
        deleteMany: {},
        create: dto.items.map((it, idx) => ({
          takaNo: it.takaNo,
          loomNo: it.loomNo ?? null,
          meters: it.meters ?? 0,
          weight: it.weight ?? 0,
          itemName: it.itemName ?? null,
          avgWeight: it.avgWeight ?? 0,
          shouldBeWeight: it.shouldBeWeight ?? 0,
          weightDiff: it.weightDiff ?? 0,
          grade: it.grade ?? null,
          designNo: it.designNo ?? null,
          shadeName: it.shadeName ?? null,
          beamTakaNo: it.beamTakaNo ?? null,
          cut: it.cut ?? null,
          sarees: it.sarees ?? 0,
          remarks: it.remarks ?? null,
          sortOrder: idx,
        })),
      };
    }

    const row = await prisma.takaReceiveJobwork.update({
      where: { id },
      data: updateData,
      select: takaReceiveSelect,
    });

    return { data: rowToDto(row) };
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Taka receive jobwork not found", 404);
    await this.repository.softDelete(id, context.tenantId);
  }
}
