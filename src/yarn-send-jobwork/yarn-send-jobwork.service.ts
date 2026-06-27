import { prisma } from "../lib/prisma";
import { AppError } from "../common/errors/appError";
import type { CrudContext } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { formatDecimalValue } from "../common/utils/decimal";
import { YarnSendJobworkRepository } from "./yarn-send-jobwork.repository";
import type {
  CreateYarnSendDto,
  YarnSendDto,
  YarnSendListQuery,
  UpdateYarnSendDto,
} from "./yarn-send-jobwork.types";

const yarnSendSelect = {
  id: true,
  serialNumber: true,
  challanDate: true,
  challanNo: true,
  firmId: true,
  firm: { select: { name: true } },
  partyId: true,
  party: { select: { name: true } },
  totalCartons: true,
  totalCheese: true,
  totalGrossWt: true,
  totalTareWt: true,
  totalNetWt: true,
  goodsRate: true,
  goodsAmount: true,
  remarks: true,
  items: {
    select: {
      id: true, cartonNo: true, itemName: true, shadeName: true, lotNo: true,
      denier: true, twist: true, twistDirection: true, cheese: true, grossWt: true,
      tareWt: true, netWt: true, remarks: true, sortOrder: true,
    },
    orderBy: { sortOrder: "asc" as const },
  },
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

function rowToDto(row: any): YarnSendDto {
  return {
    id: row.id,
    serialNumber: row.serialNumber,
    challanDate: row.challanDate.toISOString(),
    challanNo: row.challanNo,
    firmId: row.firmId,
    firmName: row.firm?.name ?? null,
    partyId: row.partyId,
    partyName: row.party?.name ?? null,
    totalCartons: row.totalCartons,
    totalCheese: formatDecimalValue(row.totalCheese),
    totalGrossWt: formatDecimalValue(row.totalGrossWt),
    totalTareWt: formatDecimalValue(row.totalTareWt),
    totalNetWt: formatDecimalValue(row.totalNetWt),
    goodsRate: formatDecimalValue(row.goodsRate),
    goodsAmount: formatDecimalValue(row.goodsAmount),
    remarks: row.remarks,
    items: row.items.map((it: any) => ({
      id: it.id,
      cartonNo: it.cartonNo,
      itemName: it.itemName,
      shadeName: it.shadeName,
      lotNo: it.lotNo,
      denier: it.denier,
      twist: it.twist,
      twistDirection: it.twistDirection,
      cheese: formatDecimalValue(it.cheese),
      grossWt: formatDecimalValue(it.grossWt),
      tareWt: formatDecimalValue(it.tareWt),
      netWt: formatDecimalValue(it.netWt),
      remarks: it.remarks,
      sortOrder: it.sortOrder,
    })),
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById,
    updatedById: row.updatedById,
    createdByName: row.createdBy?.name ?? null,
    updatedByName: row.updatedBy?.name ?? null,
  };
}

export class YarnSendJobworkService {
  constructor(private readonly repository = new YarnSendJobworkRepository()) {}

  async list(query: YarnSendListQuery, tenantId: string): Promise<RepositoryListResult<YarnSendDto>> {
    return this.repository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<YarnSendDto | null> {
    return this.repository.findById(id, tenantId);
  }

  async getNextSerialNumber(tenantId: string): Promise<string> {
    return this.repository.getNextSerialNumber(tenantId);
  }

  async create(dto: CreateYarnSendDto, context: CrudContext): Promise<{ data: YarnSendDto }> {
    const serialNumber = await this.repository.getNextSerialNumber(context.tenantId);

    let totalCheese = 0, totalGrossWt = 0, totalTareWt = 0, totalNetWt = 0;
    for (const item of dto.items) {
      totalCheese += item.cheese ?? 0;
      totalGrossWt += item.grossWt ?? 0;
      totalTareWt += item.tareWt ?? 0;
      totalNetWt += item.netWt ?? 0;
    }

    const row = await prisma.yarnSendJobwork.create({
      data: {
        tenant: { connect: { id: context.tenantId } },
        serialNumber,
        challanDate: dto.challanDate ? new Date(dto.challanDate) : new Date(),
        challanNo: dto.challanNo ?? null,
        firm: dto.firmId ? { connect: { id: dto.firmId } } : undefined,
        party: dto.partyId ? { connect: { id: dto.partyId } } : undefined,
        totalCartons: dto.items.length,
        totalCheese,
        totalGrossWt,
        totalTareWt,
        totalNetWt,
        goodsRate: dto.goodsRate ?? 0,
        goodsAmount: dto.goodsAmount ?? 0,
        remarks: dto.remarks ?? null,
        createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
        updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
        items: {
          create: dto.items.map((it, idx) => ({
            cartonNo: it.cartonNo,
            itemName: it.itemName ?? null,
            shadeName: it.shadeName ?? null,
            lotNo: it.lotNo ?? null,
            denier: it.denier ?? null,
            twist: it.twist ?? null,
            twistDirection: it.twistDirection ?? null,
            cheese: it.cheese ?? 0,
            grossWt: it.grossWt ?? 0,
            tareWt: it.tareWt ?? 0,
            netWt: it.netWt ?? 0,
            remarks: it.remarks ?? null,
            sortOrder: idx,
          })),
        },
      },
      select: yarnSendSelect,
    });

    return { data: rowToDto(row) };
  }

  async update(id: string, dto: UpdateYarnSendDto, context: CrudContext): Promise<{ data: YarnSendDto }> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Yarn send jobwork not found", 404);

    const updateData: any = {
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    };

    if (dto.challanDate) updateData.challanDate = new Date(dto.challanDate);
    if (dto.challanNo !== undefined) updateData.challanNo = dto.challanNo;
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
      let totalCheese = 0, totalGrossWt = 0, totalTareWt = 0, totalNetWt = 0;
      for (const item of dto.items) {
        totalCheese += item.cheese ?? 0;
        totalGrossWt += item.grossWt ?? 0;
        totalTareWt += item.tareWt ?? 0;
        totalNetWt += item.netWt ?? 0;
      }

      updateData.totalCartons = dto.items.length;
      updateData.totalCheese = totalCheese;
      updateData.totalGrossWt = totalGrossWt;
      updateData.totalTareWt = totalTareWt;
      updateData.totalNetWt = totalNetWt;

      updateData.items = {
        deleteMany: {},
        create: dto.items.map((it, idx) => ({
          cartonNo: it.cartonNo,
          itemName: it.itemName ?? null,
          shadeName: it.shadeName ?? null,
          lotNo: it.lotNo ?? null,
          denier: it.denier ?? null,
          twist: it.twist ?? null,
          twistDirection: it.twistDirection ?? null,
          cheese: it.cheese ?? 0,
          grossWt: it.grossWt ?? 0,
          tareWt: it.tareWt ?? 0,
          netWt: it.netWt ?? 0,
          remarks: it.remarks ?? null,
          sortOrder: idx,
        })),
      };
    }

    const row = await prisma.yarnSendJobwork.update({
      where: { id },
      data: updateData,
      select: yarnSendSelect,
    });

    return { data: rowToDto(row) };
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Yarn send jobwork not found", 404);
    await this.repository.softDelete(id, context.tenantId);
  }
}
