import { AppError } from "../common/errors/appError";
import type { CrudContext } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { BeamsRepository } from "./beams.repository";
import type {
  CreateBeamDto,
  BeamDto,
  BeamListQuery,
  UpdateBeamDto,
} from "./beams.types";

export class BeamsService {
  constructor(private readonly repository = new BeamsRepository()) {}

  async list(query: BeamListQuery, tenantId: string): Promise<RepositoryListResult<BeamDto>> {
    return this.repository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<BeamDto | null> {
    return this.repository.findById(id, tenantId);
  }

  async getNextBeamNo(tenantId: string): Promise<string> {
    return this.repository.getNextBeamNo(tenantId);
  }

  async getDistinctValues(field: "itemName" | "warperName" | "loomNo", tenantId: string): Promise<string[]> {
    return this.repository.getDistinctValues(field, tenantId);
  }

  async create(dto: CreateBeamDto, context: CrudContext): Promise<{ data: BeamDto }> {
    const beamNo = await this.repository.getNextBeamNo(context.tenantId);
    const netWt = (dto.grossWt ?? 0) - (dto.tareWt ?? 0);

    const beam = await this.repository.create({
      tenant: { connect: { id: context.tenantId } },
      beamNo,
      beamDate: dto.beamDate ? new Date(dto.beamDate) : new Date(),
      beamPipeNo: dto.beamPipeNo ?? null,
      itemName: dto.itemName ?? null,
      yarnName: dto.yarnName ?? null,
      lotNo: dto.lotNo ?? null,
      ends: dto.ends ?? 0,
      takas: dto.takas ?? 0,
      meters: dto.meters ?? 0,
      grossWt: dto.grossWt ?? 0,
      tareWt: dto.tareWt ?? 0,
      netWt: Math.max(0, netWt),
      pootha: dto.pootha ?? 0,
      beamPosition: dto.beamPosition ?? null,
      plannedMeters: dto.plannedMeters ?? 0,
      plannedTakas: dto.plannedTakas ?? 0,
      shortPercent: dto.shortPercent ?? 0,
      bhiran: dto.bhiran ?? 0,
      status: (dto.status as any) ?? "NOT_LOADED",
      party: dto.partyId ? { connect: { id: dto.partyId } } : undefined,
      warperName: dto.warperName ?? null,
      loomNo: dto.loomNo ?? null,
      remarks: dto.remarks ?? null,
      createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    });

    return { data: beam };
  }

  async update(id: string, dto: UpdateBeamDto, context: CrudContext): Promise<{ data: BeamDto }> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Beam not found", 404);

    const updateData: any = {
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    };

    if (dto.beamDate) updateData.beamDate = new Date(dto.beamDate);
    if (dto.beamPipeNo !== undefined) updateData.beamPipeNo = dto.beamPipeNo;
    if (dto.itemName !== undefined) updateData.itemName = dto.itemName;
    if (dto.yarnName !== undefined) updateData.yarnName = dto.yarnName;
    if (dto.lotNo !== undefined) updateData.lotNo = dto.lotNo;
    if (dto.ends !== undefined) updateData.ends = dto.ends;
    if (dto.takas !== undefined) updateData.takas = dto.takas;
    if (dto.meters !== undefined) updateData.meters = dto.meters;
    if (dto.pootha !== undefined) updateData.pootha = dto.pootha;
    if (dto.beamPosition !== undefined) updateData.beamPosition = dto.beamPosition;
    if (dto.plannedMeters !== undefined) updateData.plannedMeters = dto.plannedMeters;
    if (dto.plannedTakas !== undefined) updateData.plannedTakas = dto.plannedTakas;
    if (dto.shortPercent !== undefined) updateData.shortPercent = dto.shortPercent;
    if (dto.bhiran !== undefined) updateData.bhiran = dto.bhiran;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.warperName !== undefined) updateData.warperName = dto.warperName;
    if (dto.loomNo !== undefined) updateData.loomNo = dto.loomNo;
    if (dto.remarks !== undefined) updateData.remarks = dto.remarks;

    if (dto.grossWt !== undefined || dto.tareWt !== undefined) {
      const gw = dto.grossWt ?? existing.grossWt;
      const tw = dto.tareWt ?? existing.tareWt;
      updateData.grossWt = gw;
      updateData.tareWt = tw;
      updateData.netWt = Math.max(0, Number(gw) - Number(tw));
    }

    if (dto.partyId !== undefined) {
      updateData.party = dto.partyId ? { connect: { id: dto.partyId } } : { disconnect: true };
    }

    const beam = await this.repository.update(id, updateData);
    return { data: beam };
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Beam not found", 404);
    await this.repository.softDelete(id, context.tenantId);
  }
}
