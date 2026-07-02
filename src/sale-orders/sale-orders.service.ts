import { AppError } from "../common/errors/appError";
import type { CrudContext } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { SaleOrdersRepository } from "./sale-orders.repository";
import type {
  CreateSaleOrderDto,
  SaleOrderDto,
  SaleOrderListQuery,
  UpdateSaleOrderDto,
} from "./sale-orders.types";

export class SaleOrdersService {
  constructor(private readonly repository = new SaleOrdersRepository()) {}

  async list(query: SaleOrderListQuery, tenantId: string): Promise<RepositoryListResult<SaleOrderDto>> {
    return this.repository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<SaleOrderDto | null> {
    return this.repository.findById(id, tenantId);
  }

  async getNextOrderNumber(tenantId: string): Promise<string> {
    return this.repository.getNextOrderNumber(tenantId);
  }

  async create(dto: CreateSaleOrderDto, context: CrudContext): Promise<{ data: SaleOrderDto }> {
    const orderNumber = await this.repository.getNextOrderNumber(context.tenantId);

    const items = dto.items.map((item, index) => {
      const pieces = item.pieces ?? 0;
      const cut = item.cut ?? 0;
      const quantity = item.quantity ?? 0;
      const rate = item.rate ?? 0;
      const amount = quantity * rate;
      return {
        productId: item.productId ?? undefined,
        product: item.productId ? { connect: { id: item.productId } } : undefined,
        description: item.description,
        designNo: item.designNo ?? null,
        shadeName: item.shadeName ?? null,
        pieces,
        cut,
        quantity,
        rate,
        amount,
        remarks: item.remarks ?? null,
        sortOrder: index,
      };
    });

    const totalPieces = items.reduce((sum, i) => sum + i.pieces, 0);
    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);

    const order = await this.repository.create({
      tenant: { connect: { id: context.tenantId } },
      orderNumber,
      orderDate: dto.orderDate ? new Date(dto.orderDate) : new Date(),
      party: { connect: { id: dto.partyId } },
      agentName: dto.agentName ?? null,
      partyMobileNo: dto.partyMobileNo ?? null,
      orderDueDays: dto.orderDueDays ?? null,
      orderDueDate: dto.orderDueDate ? new Date(dto.orderDueDate) : null,
      billDueDays: dto.billDueDays ?? null,
      remarks: dto.remarks ?? null,
      totalPieces,
      totalQuantity,
      totalAmount,
      items: {
        create: items.map(({ productId, ...item }) => item),
      },
      createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    });

    return { data: order };
  }

  async update(id: string, dto: UpdateSaleOrderDto, context: CrudContext): Promise<{ data: SaleOrderDto }> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Sale order not found", 404);

    const updateData: any = {
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    };

    if (dto.orderDate) updateData.orderDate = new Date(dto.orderDate);
    if (dto.partyId) updateData.party = { connect: { id: dto.partyId } };
    if (dto.status) updateData.status = dto.status;
    if (dto.agentName !== undefined) updateData.agentName = dto.agentName;
    if (dto.partyMobileNo !== undefined) updateData.partyMobileNo = dto.partyMobileNo;
    if (dto.orderDueDays !== undefined) updateData.orderDueDays = dto.orderDueDays;
    if (dto.orderDueDate !== undefined) updateData.orderDueDate = dto.orderDueDate ? new Date(dto.orderDueDate) : null;
    if (dto.billDueDays !== undefined) updateData.billDueDays = dto.billDueDays;
    if (dto.remarks !== undefined) updateData.remarks = dto.remarks;

    if (dto.items) {
      const items = dto.items.map((item, index) => {
        const pieces = item.pieces ?? 0;
        const cut = item.cut ?? 0;
        const quantity = item.quantity ?? 0;
        const rate = item.rate ?? 0;
        const amount = quantity * rate;
        return {
          product: item.productId ? { connect: { id: item.productId } } : undefined,
          description: item.description,
          designNo: item.designNo ?? null,
          shadeName: item.shadeName ?? null,
          pieces,
          cut,
          quantity,
          rate,
          amount,
          remarks: item.remarks ?? null,
          sortOrder: index,
        };
      });

      updateData.totalPieces = items.reduce((sum: number, i: any) => sum + i.pieces, 0);
      updateData.totalQuantity = items.reduce((sum: number, i: any) => sum + i.quantity, 0);
      updateData.totalAmount = items.reduce((sum: number, i: any) => sum + i.amount, 0);
      updateData.items = {
        deleteMany: {},
        create: items,
      };
    }

    const order = await this.repository.update(id, context.tenantId, updateData);
    return { data: order };
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Sale order not found", 404);
    await this.repository.softDelete(id, context.tenantId);
  }
}
