import { prisma } from "../lib/prisma";
import { AppError } from "../common/errors/appError";
import type { CrudContext } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { formatDecimalValue } from "../common/utils/decimal";
import { PaletteSendJobworkRepository } from "./palette-send-jobwork.repository";
import type {
  CreatePaletteSendDto,
  PaletteSendDto,
  PaletteSendListQuery,
  UpdatePaletteSendDto,
} from "./palette-send-jobwork.types";

const paletteSendSelect = {
  id: true,
  serialNumber: true,
  challanDate: true,
  challanNo: true,
  partyId: true,
  party: { select: { name: true } },
  paletteNo: true,
  denier: true,
  yarnName: true,
  cheese: true,
  lotNo: true,
  netWt: true,
  amount: true,
  pendingCheese: true,
  issueCheese: true,
  pendingNetWt: true,
  issueNetWt: true,
  remarks: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

function rowToDto(row: any): PaletteSendDto {
  return {
    id: row.id,
    serialNumber: row.serialNumber,
    challanDate: row.challanDate.toISOString(),
    challanNo: row.challanNo,
    partyId: row.partyId,
    partyName: row.party?.name ?? null,
    paletteNo: row.paletteNo,
    denier: row.denier,
    yarnName: row.yarnName,
    cheese: formatDecimalValue(row.cheese),
    lotNo: row.lotNo,
    netWt: formatDecimalValue(row.netWt),
    amount: formatDecimalValue(row.amount),
    pendingCheese: formatDecimalValue(row.pendingCheese),
    issueCheese: formatDecimalValue(row.issueCheese),
    pendingNetWt: formatDecimalValue(row.pendingNetWt),
    issueNetWt: formatDecimalValue(row.issueNetWt),
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

export class PaletteSendJobworkService {
  constructor(private readonly repository = new PaletteSendJobworkRepository()) {}

  async list(query: PaletteSendListQuery, tenantId: string): Promise<RepositoryListResult<PaletteSendDto>> {
    return this.repository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<PaletteSendDto | null> {
    return this.repository.findById(id, tenantId);
  }

  async getNextSerialNumber(tenantId: string): Promise<string> {
    return this.repository.getNextSerialNumber(tenantId);
  }

  async create(dto: CreatePaletteSendDto, context: CrudContext): Promise<{ data: PaletteSendDto }> {
    const serialNumber = await this.repository.getNextSerialNumber(context.tenantId);

    const row = await prisma.paletteSendJobwork.create({
      data: {
        tenant: { connect: { id: context.tenantId } },
        serialNumber,
        challanDate: dto.challanDate ? new Date(dto.challanDate) : new Date(),
        challanNo: dto.challanNo ?? null,
        party: dto.partyId ? { connect: { id: dto.partyId } } : undefined,
        paletteNo: dto.paletteNo ?? null,
        denier: dto.denier ?? null,
        yarnName: dto.yarnName ?? null,
        cheese: dto.cheese ?? 0,
        lotNo: dto.lotNo ?? null,
        netWt: dto.netWt ?? 0,
        amount: dto.amount ?? 0,
        pendingCheese: dto.pendingCheese ?? 0,
        issueCheese: dto.issueCheese ?? 0,
        pendingNetWt: dto.pendingNetWt ?? 0,
        issueNetWt: dto.issueNetWt ?? 0,
        remarks: dto.remarks ?? null,
        createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
        updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
      },
      select: paletteSendSelect,
    });

    return { data: rowToDto(row) };
  }

  async update(id: string, dto: UpdatePaletteSendDto, context: CrudContext): Promise<{ data: PaletteSendDto }> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Palette send jobwork not found", 404);

    const updateData: any = {
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    };

    if (dto.challanDate) updateData.challanDate = new Date(dto.challanDate);
    if (dto.challanNo !== undefined) updateData.challanNo = dto.challanNo;
    if (dto.paletteNo !== undefined) updateData.paletteNo = dto.paletteNo;
    if (dto.denier !== undefined) updateData.denier = dto.denier;
    if (dto.yarnName !== undefined) updateData.yarnName = dto.yarnName;
    if (dto.cheese !== undefined) updateData.cheese = dto.cheese;
    if (dto.lotNo !== undefined) updateData.lotNo = dto.lotNo;
    if (dto.netWt !== undefined) updateData.netWt = dto.netWt;
    if (dto.amount !== undefined) updateData.amount = dto.amount;
    if (dto.pendingCheese !== undefined) updateData.pendingCheese = dto.pendingCheese;
    if (dto.issueCheese !== undefined) updateData.issueCheese = dto.issueCheese;
    if (dto.pendingNetWt !== undefined) updateData.pendingNetWt = dto.pendingNetWt;
    if (dto.issueNetWt !== undefined) updateData.issueNetWt = dto.issueNetWt;
    if (dto.remarks !== undefined) updateData.remarks = dto.remarks;

    if (dto.partyId !== undefined) {
      updateData.party = dto.partyId ? { connect: { id: dto.partyId } } : { disconnect: true };
    }

    const row = await prisma.paletteSendJobwork.update({
      where: { id },
      data: updateData,
      select: paletteSendSelect,
    });

    return { data: rowToDto(row) };
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Palette send jobwork not found", 404);
    await this.repository.softDelete(id, context.tenantId);
  }
}
