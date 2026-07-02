import { AppError } from "../common/errors/appError";
import type { CrudContext } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { YarnPurchasesRepository } from "./yarn-purchases.repository";
import type {
  CreateYarnPurchaseDto,
  YarnPurchaseDto,
  YarnPurchaseListQuery,
  UpdateYarnPurchaseDto,
} from "./yarn-purchases.types";

export class YarnPurchasesService {
  constructor(private readonly repository = new YarnPurchasesRepository()) {}

  async list(query: YarnPurchaseListQuery, tenantId: string): Promise<RepositoryListResult<YarnPurchaseDto>> {
    return this.repository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<YarnPurchaseDto | null> {
    return this.repository.findById(id, tenantId);
  }

  async getNextSerialNumber(tenantId: string): Promise<string> {
    return this.repository.getNextSerialNumber(tenantId);
  }

  async create(dto: CreateYarnPurchaseDto, context: CrudContext): Promise<{ data: YarnPurchaseDto }> {
    const serialNumber = await this.repository.getNextSerialNumber(context.tenantId);

    const items = dto.items.map((item, index) => {
      const grossWt = item.grossWt ?? 0;
      const tareWt = item.tareWt ?? 0;
      const netWt = grossWt - tareWt;
      const rate = item.rate ?? 0;
      const amount = netWt * rate;
      return {
        cartonNo: item.cartonNo,
        itemName: item.itemName,
        shadeName: item.shadeName ?? null,
        lotNo: item.lotNo ?? null,
        denier: item.denier ?? null,
        twist: item.twist ?? null,
        twistDirection: item.twistDirection ?? null,
        cheese: item.cheese ?? 0,
        grossWt,
        tareWt,
        netWt,
        rate,
        amount,
        sortOrder: index,
      };
    });

    const totalCartons = items.length;
    const totalCheese = items.reduce((sum, i) => sum + (Number(i.cheese) || 0), 0);
    const totalGrossWt = items.reduce((sum, i) => sum + i.grossWt, 0);
    const totalTareWt = items.reduce((sum, i) => sum + i.tareWt, 0);
    const totalNetWt = items.reduce((sum, i) => sum + i.netWt, 0);
    const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);

    const igstRate = dto.igstRate ?? 0;
    const cgstRate = dto.cgstRate ?? 0;
    const sgstRate = dto.sgstRate ?? 0;
    const igstAmount = totalAmount * (igstRate / 100);
    const cgstAmount = totalAmount * (cgstRate / 100);
    const sgstAmount = totalAmount * (sgstRate / 100);
    const billAmount = dto.billAmount ?? (totalAmount + igstAmount + cgstAmount + sgstAmount);

    const purchase = await this.repository.create({
      tenant: { connect: { id: context.tenantId } },
      serialNumber,
      purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : new Date(),
      billNo: dto.billNo ?? null,
      billDate: dto.billDate ? new Date(dto.billDate) : null,
      party: { connect: { id: dto.partyId } },
      billType: dto.billType ?? "PURCHASE ACCOUNT",
      totalCartons,
      totalCheese,
      totalGrossWt,
      totalTareWt,
      totalNetWt,
      totalAmount,
      igstRate,
      igstAmount,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      billAmount,
      adjustedAmount: dto.adjustedAmount ?? 0,
      gstReceived: dto.gstReceived ?? false,
      billRemarks: dto.billRemarks ?? null,
      items: { create: items },
      createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    });

    return { data: purchase };
  }

  async update(id: string, dto: UpdateYarnPurchaseDto, context: CrudContext): Promise<{ data: YarnPurchaseDto }> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Yarn purchase not found", 404);

    const updateData: any = {
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    };

    if (dto.purchaseDate) updateData.purchaseDate = new Date(dto.purchaseDate);
    if (dto.partyId) updateData.party = { connect: { id: dto.partyId } };
    if (dto.billNo !== undefined) updateData.billNo = dto.billNo;
    if (dto.billDate !== undefined) updateData.billDate = dto.billDate ? new Date(dto.billDate) : null;
    if (dto.billType) updateData.billType = dto.billType;
    if (dto.gstReceived !== undefined) updateData.gstReceived = dto.gstReceived;
    if (dto.billRemarks !== undefined) updateData.billRemarks = dto.billRemarks;
    if (dto.adjustedAmount !== undefined) updateData.adjustedAmount = dto.adjustedAmount;

    if (dto.items) {
      const items = dto.items.map((item, index) => {
        const grossWt = item.grossWt ?? 0;
        const tareWt = item.tareWt ?? 0;
        const netWt = grossWt - tareWt;
        const rate = item.rate ?? 0;
        const amount = netWt * rate;
        return {
          cartonNo: item.cartonNo,
          itemName: item.itemName,
          shadeName: item.shadeName ?? null,
          lotNo: item.lotNo ?? null,
          denier: item.denier ?? null,
          twist: item.twist ?? null,
          twistDirection: item.twistDirection ?? null,
          cheese: item.cheese ?? 0,
          grossWt,
          tareWt,
          netWt,
          rate,
          amount,
          sortOrder: index,
        };
      });

      updateData.totalCartons = items.length;
      updateData.totalCheese = items.reduce((sum: number, i: any) => sum + (Number(i.cheese) || 0), 0);
      updateData.totalGrossWt = items.reduce((sum: number, i: any) => sum + i.grossWt, 0);
      updateData.totalTareWt = items.reduce((sum: number, i: any) => sum + i.tareWt, 0);
      updateData.totalNetWt = items.reduce((sum: number, i: any) => sum + i.netWt, 0);
      updateData.totalAmount = items.reduce((sum: number, i: any) => sum + i.amount, 0);

      const igstRate = dto.igstRate ?? existing.igstRate;
      const cgstRate = dto.cgstRate ?? existing.cgstRate;
      const sgstRate = dto.sgstRate ?? existing.sgstRate;
      updateData.igstRate = igstRate;
      updateData.cgstRate = cgstRate;
      updateData.sgstRate = sgstRate;
      updateData.igstAmount = updateData.totalAmount * (igstRate / 100);
      updateData.cgstAmount = updateData.totalAmount * (cgstRate / 100);
      updateData.sgstAmount = updateData.totalAmount * (sgstRate / 100);
      updateData.billAmount = dto.billAmount ?? (updateData.totalAmount + updateData.igstAmount + updateData.cgstAmount + updateData.sgstAmount);

      updateData.items = { deleteMany: {}, create: items };
    } else {
      if (dto.igstRate !== undefined) updateData.igstRate = dto.igstRate;
      if (dto.cgstRate !== undefined) updateData.cgstRate = dto.cgstRate;
      if (dto.sgstRate !== undefined) updateData.sgstRate = dto.sgstRate;
      if (dto.billAmount !== undefined) updateData.billAmount = dto.billAmount;
    }

    const purchase = await this.repository.update(id, context.tenantId, updateData);
    return { data: purchase };
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Yarn purchase not found", 404);
    await this.repository.softDelete(id, context.tenantId);
  }
}
