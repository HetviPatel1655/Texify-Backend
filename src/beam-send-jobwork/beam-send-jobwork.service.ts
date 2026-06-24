import { prisma } from "../lib/prisma.js";
import { AppError } from "../common/errors/appError.js";
import type { CrudContext } from "../common/services/baseCrud.service.js";
import type { RepositoryListResult } from "../common/repositories/base.repository.js";
import { formatDecimalValue } from "../common/utils/decimal.js";
import { BeamSendJobworkRepository } from "./beam-send-jobwork.repository.js";
import type {
  CreateBeamSendDto,
  BeamSendDto,
  BeamSendListQuery,
  UpdateBeamSendDto,
} from "./beam-send-jobwork.types.js";

const beamSendSelect = {
  id: true,
  serialNumber: true,
  challanDate: true,
  challanNo: true,
  firmId: true,
  firm: { select: { name: true } },
  partyId: true,
  party: { select: { name: true } },
  totalBeamPipes: true,
  totalTakas: true,
  totalMeters: true,
  totalGrossWt: true,
  totalTareWt: true,
  totalNetWt: true,
  totalPootha: true,
  goodsRate: true,
  goodsAmount: true,
  remarks: true,
  items: {
    select: {
      id: true, beamId: true, beamNo: true, yarnName: true, lotNo: true,
      ends: true, takas: true, meters: true, grossWt: true, tareWt: true,
      netWt: true, pootha: true, remarks: true, sortOrder: true,
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

function rowToDto(row: any): BeamSendDto {
  return {
    id: row.id,
    serialNumber: row.serialNumber,
    challanDate: row.challanDate.toISOString(),
    challanNo: row.challanNo,
    firmId: row.firmId,
    firmName: row.firm?.name ?? null,
    partyId: row.partyId,
    partyName: row.party?.name ?? null,
    totalBeamPipes: row.totalBeamPipes,
    totalTakas: formatDecimalValue(row.totalTakas),
    totalMeters: formatDecimalValue(row.totalMeters),
    totalGrossWt: formatDecimalValue(row.totalGrossWt),
    totalTareWt: formatDecimalValue(row.totalTareWt),
    totalNetWt: formatDecimalValue(row.totalNetWt),
    totalPootha: formatDecimalValue(row.totalPootha),
    goodsRate: formatDecimalValue(row.goodsRate),
    goodsAmount: formatDecimalValue(row.goodsAmount),
    remarks: row.remarks,
    items: row.items.map((it: any) => ({
      id: it.id,
      beamId: it.beamId,
      beamNo: it.beamNo,
      yarnName: it.yarnName,
      lotNo: it.lotNo,
      ends: it.ends,
      takas: formatDecimalValue(it.takas),
      meters: formatDecimalValue(it.meters),
      grossWt: formatDecimalValue(it.grossWt),
      tareWt: formatDecimalValue(it.tareWt),
      netWt: formatDecimalValue(it.netWt),
      pootha: formatDecimalValue(it.pootha),
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

export class BeamSendJobworkService {
  constructor(private readonly repository = new BeamSendJobworkRepository()) {}

  async list(query: BeamSendListQuery, tenantId: string): Promise<RepositoryListResult<BeamSendDto>> {
    return this.repository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<BeamSendDto | null> {
    return this.repository.findById(id, tenantId);
  }

  async getNextSerialNumber(tenantId: string): Promise<string> {
    return this.repository.getNextSerialNumber(tenantId);
  }

  async create(dto: CreateBeamSendDto, context: CrudContext): Promise<{ data: BeamSendDto }> {
    const serialNumber = await this.repository.getNextSerialNumber(context.tenantId);

    let totalTakas = 0, totalMeters = 0, totalGrossWt = 0, totalTareWt = 0, totalNetWt = 0, totalPootha = 0;
    for (const item of dto.items) {
      totalTakas += item.takas ?? 0;
      totalMeters += item.meters ?? 0;
      totalGrossWt += item.grossWt ?? 0;
      totalTareWt += item.tareWt ?? 0;
      totalNetWt += item.netWt ?? 0;
      totalPootha += item.pootha ?? 0;
    }

    const row = await prisma.beamSendJobwork.create({
      data: {
        tenant: { connect: { id: context.tenantId } },
        serialNumber,
        challanDate: dto.challanDate ? new Date(dto.challanDate) : new Date(),
        challanNo: dto.challanNo ?? null,
        firm: dto.firmId ? { connect: { id: dto.firmId } } : undefined,
        party: dto.partyId ? { connect: { id: dto.partyId } } : undefined,
        totalBeamPipes: dto.items.length,
        totalTakas,
        totalMeters,
        totalGrossWt,
        totalTareWt,
        totalNetWt,
        totalPootha,
        goodsRate: dto.goodsRate ?? 0,
        goodsAmount: dto.goodsAmount ?? 0,
        remarks: dto.remarks ?? null,
        createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
        updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
        items: {
          create: dto.items.map((it, idx) => ({
            beam: it.beamId ? { connect: { id: it.beamId } } : undefined,
            beamNo: it.beamNo,
            yarnName: it.yarnName ?? null,
            lotNo: it.lotNo ?? null,
            ends: it.ends ?? 0,
            takas: it.takas ?? 0,
            meters: it.meters ?? 0,
            grossWt: it.grossWt ?? 0,
            tareWt: it.tareWt ?? 0,
            netWt: it.netWt ?? 0,
            pootha: it.pootha ?? 0,
            remarks: it.remarks ?? null,
            sortOrder: idx,
          })),
        },
      },
      select: beamSendSelect,
    });

    // Update beam statuses to SENT_TO_JOBWORK
    const beamIds = dto.items.map((it) => it.beamId).filter(Boolean) as string[];
    if (beamIds.length > 0) {
      await prisma.beam.updateMany({
        where: { id: { in: beamIds }, tenantId: context.tenantId },
        data: { status: "SENT_TO_JOBWORK" },
      });
    }

    return { data: rowToDto(row) };
  }

  async update(id: string, dto: UpdateBeamSendDto, context: CrudContext): Promise<{ data: BeamSendDto }> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Beam send jobwork not found", 404);

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
      let totalTakas = 0, totalMeters = 0, totalGrossWt = 0, totalTareWt = 0, totalNetWt = 0, totalPootha = 0;
      for (const item of dto.items) {
        totalTakas += item.takas ?? 0;
        totalMeters += item.meters ?? 0;
        totalGrossWt += item.grossWt ?? 0;
        totalTareWt += item.tareWt ?? 0;
        totalNetWt += item.netWt ?? 0;
        totalPootha += item.pootha ?? 0;
      }

      updateData.totalBeamPipes = dto.items.length;
      updateData.totalTakas = totalTakas;
      updateData.totalMeters = totalMeters;
      updateData.totalGrossWt = totalGrossWt;
      updateData.totalTareWt = totalTareWt;
      updateData.totalNetWt = totalNetWt;
      updateData.totalPootha = totalPootha;

      updateData.items = {
        deleteMany: {},
        create: dto.items.map((it, idx) => ({
          beam: it.beamId ? { connect: { id: it.beamId } } : undefined,
          beamNo: it.beamNo,
          yarnName: it.yarnName ?? null,
          lotNo: it.lotNo ?? null,
          ends: it.ends ?? 0,
          takas: it.takas ?? 0,
          meters: it.meters ?? 0,
          grossWt: it.grossWt ?? 0,
          tareWt: it.tareWt ?? 0,
          netWt: it.netWt ?? 0,
          pootha: it.pootha ?? 0,
          remarks: it.remarks ?? null,
          sortOrder: idx,
        })),
      };
    }

    const row = await prisma.beamSendJobwork.update({
      where: { id },
      data: updateData,
      select: beamSendSelect,
    });

    return { data: rowToDto(row) };
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Beam send jobwork not found", 404);
    await this.repository.softDelete(id, context.tenantId);
  }
}
