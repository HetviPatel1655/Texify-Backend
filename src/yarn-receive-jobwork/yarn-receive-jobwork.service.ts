import { prisma } from "../lib/prisma";
import { AppError } from "../common/errors/appError";
import type { CrudContext } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { formatDecimalValue } from "../common/utils/decimal";
import { YarnReceiveJobworkRepository } from "./yarn-receive-jobwork.repository";
import type {
  CreateYarnReceiveDto,
  YarnReceiveDto,
  YarnReceiveListQuery,
  UpdateYarnReceiveDto,
} from "./yarn-receive-jobwork.types";

const yarnReceiveSelect = {
  id: true,
  serialNumber: true,
  challanDate: true,
  challanNo: true,
  partyId: true,
  party: { select: { name: true } },
  yarnName: true,
  shadeName: true,
  emptyRollWt: true,
  lotNo: true,
  denier: true,
  twist: true,
  cages: true,
  rolls: true,
  grossWt: true,
  tareWt: true,
  netWt: true,
  goodsRate: true,
  goodsAmount: true,
  deptName: true,
  originalChallanNo: true,
  originalChallanDate: true,
  remarks: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  createdBy: { select: { name: true } },
  updatedBy: { select: { name: true } },
} as const;

function rowToDto(row: any): YarnReceiveDto {
  return {
    id: row.id,
    serialNumber: row.serialNumber,
    challanDate: row.challanDate.toISOString(),
    challanNo: row.challanNo,
    partyId: row.partyId,
    partyName: row.party?.name ?? null,
    yarnName: row.yarnName,
    shadeName: row.shadeName,
    emptyRollWt: formatDecimalValue(row.emptyRollWt),
    lotNo: row.lotNo,
    denier: row.denier,
    twist: row.twist,
    cages: row.cages,
    rolls: row.rolls,
    grossWt: formatDecimalValue(row.grossWt),
    tareWt: formatDecimalValue(row.tareWt),
    netWt: formatDecimalValue(row.netWt),
    goodsRate: formatDecimalValue(row.goodsRate),
    goodsAmount: formatDecimalValue(row.goodsAmount),
    deptName: row.deptName,
    originalChallanNo: row.originalChallanNo,
    originalChallanDate: row.originalChallanDate ? row.originalChallanDate.toISOString() : null,
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

export class YarnReceiveJobworkService {
  constructor(private readonly repository = new YarnReceiveJobworkRepository()) {}

  async list(query: YarnReceiveListQuery, tenantId: string): Promise<RepositoryListResult<YarnReceiveDto>> {
    return this.repository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<YarnReceiveDto | null> {
    return this.repository.findById(id, tenantId);
  }

  async getNextSerialNumber(tenantId: string): Promise<string> {
    return this.repository.getNextSerialNumber(tenantId);
  }

  async create(dto: CreateYarnReceiveDto, context: CrudContext): Promise<{ data: YarnReceiveDto }> {
    const serialNumber = await this.repository.getNextSerialNumber(context.tenantId);

    const row = await prisma.yarnReceiveJobwork.create({
      data: {
        tenant: { connect: { id: context.tenantId } },
        serialNumber,
        challanDate: dto.challanDate ? new Date(dto.challanDate) : new Date(),
        challanNo: dto.challanNo ?? null,
        party: dto.partyId ? { connect: { id: dto.partyId } } : undefined,
        yarnName: dto.yarnName ?? null,
        shadeName: dto.shadeName ?? null,
        emptyRollWt: dto.emptyRollWt ?? 0,
        lotNo: dto.lotNo ?? null,
        denier: dto.denier ?? null,
        twist: dto.twist ?? null,
        cages: dto.cages ?? 0,
        rolls: dto.rolls ?? 0,
        grossWt: dto.grossWt ?? 0,
        tareWt: dto.tareWt ?? 0,
        netWt: dto.netWt ?? 0,
        goodsRate: dto.goodsRate ?? 0,
        goodsAmount: dto.goodsAmount ?? 0,
        deptName: dto.deptName ?? null,
        originalChallanNo: dto.originalChallanNo ?? null,
        originalChallanDate: dto.originalChallanDate ? new Date(dto.originalChallanDate) : null,
        remarks: dto.remarks ?? null,
        createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
        updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
      },
      select: yarnReceiveSelect,
    });

    return { data: rowToDto(row) };
  }

  async update(id: string, dto: UpdateYarnReceiveDto, context: CrudContext): Promise<{ data: YarnReceiveDto }> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Yarn receive jobwork not found", 404);

    const updateData: any = {
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    };

    if (dto.challanDate) updateData.challanDate = new Date(dto.challanDate);
    if (dto.challanNo !== undefined) updateData.challanNo = dto.challanNo;
    if (dto.yarnName !== undefined) updateData.yarnName = dto.yarnName;
    if (dto.shadeName !== undefined) updateData.shadeName = dto.shadeName;
    if (dto.emptyRollWt !== undefined) updateData.emptyRollWt = dto.emptyRollWt;
    if (dto.lotNo !== undefined) updateData.lotNo = dto.lotNo;
    if (dto.denier !== undefined) updateData.denier = dto.denier;
    if (dto.twist !== undefined) updateData.twist = dto.twist;
    if (dto.cages !== undefined) updateData.cages = dto.cages;
    if (dto.rolls !== undefined) updateData.rolls = dto.rolls;
    if (dto.grossWt !== undefined) updateData.grossWt = dto.grossWt;
    if (dto.tareWt !== undefined) updateData.tareWt = dto.tareWt;
    if (dto.netWt !== undefined) updateData.netWt = dto.netWt;
    if (dto.goodsRate !== undefined) updateData.goodsRate = dto.goodsRate;
    if (dto.goodsAmount !== undefined) updateData.goodsAmount = dto.goodsAmount;
    if (dto.deptName !== undefined) updateData.deptName = dto.deptName;
    if (dto.originalChallanNo !== undefined) updateData.originalChallanNo = dto.originalChallanNo;
    if (dto.originalChallanDate !== undefined) {
      updateData.originalChallanDate = dto.originalChallanDate ? new Date(dto.originalChallanDate) : null;
    }
    if (dto.remarks !== undefined) updateData.remarks = dto.remarks;

    if (dto.partyId !== undefined) {
      updateData.party = dto.partyId ? { connect: { id: dto.partyId } } : { disconnect: true };
    }

    const row = await prisma.yarnReceiveJobwork.update({
      where: { id },
      data: updateData,
      select: yarnReceiveSelect,
    });

    return { data: rowToDto(row) };
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Yarn receive jobwork not found", 404);
    await this.repository.softDelete(id, context.tenantId);
  }
}
