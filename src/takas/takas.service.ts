import { AppError } from "../common/errors/appError";
import type { CrudContext } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { TakasRepository } from "./takas.repository";
import type { CreateTakaDto, TakaDto, TakaListQuery, UpdateTakaDto } from "./takas.types";

export class TakasService {
  constructor(private readonly repository = new TakasRepository()) {}

  async list(query: TakaListQuery, tenantId: string): Promise<RepositoryListResult<TakaDto>> {
    return this.repository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<TakaDto | null> {
    return this.repository.findById(id, tenantId);
  }

  async getByTakaNo(takaNo: string, tenantId: string): Promise<TakaDto | null> {
    return this.repository.findByTakaNo(takaNo, tenantId);
  }

  async getNextTakaNo(tenantId: string, prefix?: string): Promise<string> {
    return this.repository.getNextTakaNo(tenantId, prefix);
  }

  async getDistinctValues(field: "itemName" | "workerName" | "loomNo" | "grade" | "shadeName" | "designNo", tenantId: string): Promise<string[]> {
    return this.repository.getDistinctValues(field, tenantId);
  }

  async getStockSummary(tenantId: string, filters: { dateFrom?: string; dateTo?: string; itemName?: string }): Promise<any[]> {
    return this.repository.getStockSummary(tenantId, filters);
  }

  async create(dto: CreateTakaDto, context: CrudContext): Promise<{ data: TakaDto }> {
    const takaNo = dto.takaNo || await this.repository.getNextTakaNo(context.tenantId, dto.takaPrefix);
    const computed = this.computeFields(dto.meters ?? 0, dto.weight ?? 0, dto.wtPerMtr ?? 0);

    const taka = await this.repository.create({
      tenant: { connect: { id: context.tenantId } },
      takaNo,
      takaPrefix: dto.takaPrefix ?? null,
      date: dto.date ? new Date(dto.date) : new Date(),
      loomNo: dto.loomNo ?? null,
      beam: dto.beamId ? { connect: { id: dto.beamId } } : undefined,
      firm: dto.firmId ? { connect: { id: dto.firmId } } : undefined,
      itemName: dto.itemName ?? null,
      grade: dto.grade ?? null,
      designNo: dto.designNo ?? null,
      shadeName: dto.shadeName ?? null,
      meters: dto.meters ?? 0,
      weight: dto.weight ?? 0,
      avgWeightPerMeter: computed.avgWeightPerMeter,
      shouldBeWeight: computed.shouldBeWeight,
      weightDiff: computed.weightDiff,
      sarees: dto.sarees ?? 0,
      pieces: dto.pieces ?? 0,
      cut: dto.cut ?? null,
      workerName: dto.workerName ?? null,
      foldingDate: dto.foldingDate ? new Date(dto.foldingDate) : null,
      startingDate: dto.startingDate ? new Date(dto.startingDate) : null,
      cuttingDate: dto.cuttingDate ? new Date(dto.cuttingDate) : null,
      salaryDate: dto.salaryDate ? new Date(dto.salaryDate) : null,
      wtPerMtr: dto.wtPerMtr ?? 0,
      status: (dto.status as any) ?? "IN_STOCK",
      isWithBeam: dto.isWithBeam ?? false,
      serialNoWiseTaka: dto.serialNoWiseTaka ?? false,
      remarks: dto.remarks ?? null,
      createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    });

    return { data: taka };
  }

  async createMulti(dtos: CreateTakaDto[], commonFields: { date?: string; workerName?: string; takaPrefix?: string; serialNoWiseTaka?: boolean }, context: CrudContext): Promise<{ data: TakaDto[] }> {
    const results: TakaDto[] = [];
    for (const dto of dtos) {
      const merged = {
        ...dto,
        date: dto.date || commonFields.date,
        workerName: dto.workerName || commonFields.workerName,
        takaPrefix: dto.takaPrefix || commonFields.takaPrefix,
        serialNoWiseTaka: dto.serialNoWiseTaka ?? commonFields.serialNoWiseTaka,
      };
      const result = await this.create(merged, context);
      results.push(result.data);
    }
    return { data: results };
  }

  async update(id: string, dto: UpdateTakaDto, context: CrudContext): Promise<{ data: TakaDto }> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Taka not found", 404);

    const updateData: any = {
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    };

    if (dto.date) updateData.date = new Date(dto.date);
    if (dto.loomNo !== undefined) updateData.loomNo = dto.loomNo;
    if (dto.itemName !== undefined) updateData.itemName = dto.itemName;
    if (dto.grade !== undefined) updateData.grade = dto.grade;
    if (dto.designNo !== undefined) updateData.designNo = dto.designNo;
    if (dto.shadeName !== undefined) updateData.shadeName = dto.shadeName;
    if (dto.meters !== undefined) updateData.meters = dto.meters;
    if (dto.weight !== undefined) updateData.weight = dto.weight;
    if (dto.sarees !== undefined) updateData.sarees = dto.sarees;
    if (dto.pieces !== undefined) updateData.pieces = dto.pieces;
    if (dto.cut !== undefined) updateData.cut = dto.cut;
    if (dto.workerName !== undefined) updateData.workerName = dto.workerName;
    if (dto.wtPerMtr !== undefined) updateData.wtPerMtr = dto.wtPerMtr;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.remarks !== undefined) updateData.remarks = dto.remarks;
    if (dto.takaPrefix !== undefined) updateData.takaPrefix = dto.takaPrefix;
    if (dto.serialNoWiseTaka !== undefined) updateData.serialNoWiseTaka = dto.serialNoWiseTaka;
    if (dto.foldingDate !== undefined) updateData.foldingDate = dto.foldingDate ? new Date(dto.foldingDate) : null;
    if (dto.startingDate !== undefined) updateData.startingDate = dto.startingDate ? new Date(dto.startingDate) : null;
    if (dto.cuttingDate !== undefined) updateData.cuttingDate = dto.cuttingDate ? new Date(dto.cuttingDate) : null;
    if (dto.salaryDate !== undefined) updateData.salaryDate = dto.salaryDate ? new Date(dto.salaryDate) : null;

    if (dto.meters !== undefined || dto.weight !== undefined || dto.wtPerMtr !== undefined) {
      const m = dto.meters ?? existing.meters;
      const w = dto.weight ?? existing.weight;
      const wpm = dto.wtPerMtr ?? existing.wtPerMtr;
      const computed = this.computeFields(Number(m), Number(w), Number(wpm));
      updateData.avgWeightPerMeter = computed.avgWeightPerMeter;
      updateData.shouldBeWeight = computed.shouldBeWeight;
      updateData.weightDiff = computed.weightDiff;
    }

    if (dto.beamId !== undefined) {
      updateData.beam = dto.beamId ? { connect: { id: dto.beamId } } : { disconnect: true };
    }
    if (dto.firmId !== undefined) {
      updateData.firm = dto.firmId ? { connect: { id: dto.firmId } } : { disconnect: true };
    }

    const taka = await this.repository.update(id, context.tenantId, updateData);
    return { data: taka };
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Taka not found", 404);
    await this.repository.softDelete(id, context.tenantId);
  }

  private computeFields(meters: number, weight: number, wtPerMtr: number) {
    const avgWeightPerMeter = meters > 0 ? weight / meters : 0;
    const shouldBeWeight = wtPerMtr > 0 && meters > 0 ? wtPerMtr * meters : 0;
    const weightDiff = weight - shouldBeWeight;
    return {
      avgWeightPerMeter: Math.round(avgWeightPerMeter * 1000) / 1000,
      shouldBeWeight: Math.round(shouldBeWeight * 1000) / 1000,
      weightDiff: Math.round(weightDiff * 1000) / 1000,
    };
  }
}
