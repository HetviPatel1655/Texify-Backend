import { prisma } from "../lib/prisma";
import { AppError } from "../common/errors/appError";
import type { CrudContext } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { formatDecimalValue } from "../common/utils/decimal";
import { RollsSendJobworkRepository } from "./rolls-send-jobwork.repository";
import type {
  CreateRollsSendDto,
  RollsSendDto,
  RollsSendListQuery,
  UpdateRollsSendDto,
} from "./rolls-send-jobwork.types";

const rollsSendSelect = {
  id: true,
  serialNumber: true,
  challanDate: true,
  challanNo: true,
  partyId: true,
  party: { select: { name: true } },
  yarnName: true,
  lotNo: true,
  cages: true,
  rolls: true,
  grossWt: true,
  tareWt: true,
  netWt: true,
  emptyRollWt: true,
  remarks: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

function rowToDto(row: any): RollsSendDto {
  return {
    id: row.id,
    serialNumber: row.serialNumber,
    challanDate: row.challanDate.toISOString(),
    challanNo: row.challanNo,
    partyId: row.partyId,
    partyName: row.party?.name ?? null,
    yarnName: row.yarnName,
    lotNo: row.lotNo,
    cages: row.cages,
    rolls: row.rolls,
    grossWt: formatDecimalValue(row.grossWt),
    tareWt: formatDecimalValue(row.tareWt),
    netWt: formatDecimalValue(row.netWt),
    emptyRollWt: formatDecimalValue(row.emptyRollWt),
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

export class RollsSendJobworkService {
  constructor(private readonly repository = new RollsSendJobworkRepository()) {}

  async list(query: RollsSendListQuery, tenantId: string): Promise<RepositoryListResult<RollsSendDto>> {
    return this.repository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<RollsSendDto | null> {
    return this.repository.findById(id, tenantId);
  }

  async getNextSerialNumber(tenantId: string): Promise<string> {
    return this.repository.getNextSerialNumber(tenantId);
  }

  async create(dto: CreateRollsSendDto, context: CrudContext): Promise<{ data: RollsSendDto }> {
    const serialNumber = await this.repository.getNextSerialNumber(context.tenantId);

    const row = await prisma.rollsSendJobwork.create({
      data: {
        tenant: { connect: { id: context.tenantId } },
        serialNumber,
        challanDate: dto.challanDate ? new Date(dto.challanDate) : new Date(),
        challanNo: dto.challanNo ?? null,
        party: dto.partyId ? { connect: { id: dto.partyId } } : undefined,
        yarnName: dto.yarnName ?? null,
        lotNo: dto.lotNo ?? null,
        cages: dto.cages ?? 0,
        rolls: dto.rolls ?? 0,
        grossWt: dto.grossWt ?? 0,
        tareWt: dto.tareWt ?? 0,
        netWt: dto.netWt ?? 0,
        emptyRollWt: dto.emptyRollWt ?? 0,
        remarks: dto.remarks ?? null,
        createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
        updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
      },
      select: rollsSendSelect,
    });

    return { data: rowToDto(row) };
  }

  async update(id: string, dto: UpdateRollsSendDto, context: CrudContext): Promise<{ data: RollsSendDto }> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Rolls send jobwork not found", 404);

    const updateData: any = {
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    };

    if (dto.challanDate) updateData.challanDate = new Date(dto.challanDate);
    if (dto.challanNo !== undefined) updateData.challanNo = dto.challanNo;
    if (dto.yarnName !== undefined) updateData.yarnName = dto.yarnName;
    if (dto.lotNo !== undefined) updateData.lotNo = dto.lotNo;
    if (dto.cages !== undefined) updateData.cages = dto.cages;
    if (dto.rolls !== undefined) updateData.rolls = dto.rolls;
    if (dto.grossWt !== undefined) updateData.grossWt = dto.grossWt;
    if (dto.tareWt !== undefined) updateData.tareWt = dto.tareWt;
    if (dto.netWt !== undefined) updateData.netWt = dto.netWt;
    if (dto.emptyRollWt !== undefined) updateData.emptyRollWt = dto.emptyRollWt;
    if (dto.remarks !== undefined) updateData.remarks = dto.remarks;

    if (dto.partyId !== undefined) {
      updateData.party = dto.partyId ? { connect: { id: dto.partyId } } : { disconnect: true };
    }

    const row = await prisma.rollsSendJobwork.update({
      where: { id },
      data: updateData,
      select: rollsSendSelect,
    });

    return { data: rowToDto(row) };
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Rolls send jobwork not found", 404);
    await this.repository.softDelete(id, context.tenantId);
  }
}
