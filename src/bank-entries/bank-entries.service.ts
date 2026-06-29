import { AppError } from "../common/errors/appError";
import type { CrudContext } from "../common/services/baseCrud.service";
import type { RepositoryListResult } from "../common/repositories/base.repository";
import { prisma } from "../lib/prisma";
import { formatDecimalValue } from "../common/utils/decimal";
import { BankEntriesRepository } from "./bank-entries.repository";
import type {
  CreateBankEntryDto,
  BankEntryDto,
  BankEntryListQuery,
  UpdateBankEntryDto,
  OutstandingInvoiceDto,
} from "./bank-entries.types";

export class BankEntriesService {
  constructor(private readonly repository = new BankEntriesRepository()) {}

  async list(query: BankEntryListQuery, tenantId: string): Promise<RepositoryListResult<BankEntryDto>> {
    return this.repository.list(query, tenantId);
  }

  async getById(id: string, tenantId: string): Promise<BankEntryDto | null> {
    return this.repository.findById(id, tenantId);
  }

  async getNextSerialNumber(tenantId: string, type: "SLIP" | "CHEQUE"): Promise<string> {
    return this.repository.getNextSerialNumber(tenantId, type);
  }

  async getOutstandingInvoices(partyId: string, tenantId: string): Promise<OutstandingInvoiceDto[]> {
    return this.repository.getOutstandingInvoices(partyId, tenantId);
  }

  async create(dto: CreateBankEntryDto, context: CrudContext): Promise<{ data: BankEntryDto }> {
    const serialNumber = await this.repository.getNextSerialNumber(context.tenantId, dto.type);

    const adjustments = dto.adjustments ?? [];
    const totalAdjusted = adjustments.reduce((sum, a) => sum + a.amount, 0);

    if (dto.billWisePayment && adjustments.length > 0) {
      if (totalAdjusted > dto.amount) {
        throw new AppError("Total adjustments cannot exceed entry amount", 400);
      }
      await this.validateAdjustments(adjustments, dto.partyId, context.tenantId);
    }

    const unadjustedAmount = dto.amount - totalAdjusted;

    const entry = await this.repository.create({
      tenant: { connect: { id: context.tenantId } },
      serialNumber,
      type: dto.type,
      entryDate: dto.entryDate ? new Date(dto.entryDate) : new Date(),
      slipRecNo: dto.slipRecNo ?? null,
      bankName: dto.bankName,
      party: { connect: { id: dto.partyId } },
      chequeNo: dto.chequeNo ?? null,
      chequeDate: dto.chequeDate ? new Date(dto.chequeDate) : null,
      amount: dto.amount,
      remarks: dto.remarks ?? null,
      billWisePayment: dto.billWisePayment ?? false,
      unadjustedAmount,
      adjustments:
        dto.billWisePayment && adjustments.length > 0
          ? {
              create: adjustments.map((a) => ({
                invoice: { connect: { id: a.invoiceId } },
                amount: a.amount,
              })),
            }
          : undefined,
      createdBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    });

    if (dto.billWisePayment && adjustments.length > 0) {
      await this.updateInvoicePaymentStatuses(adjustments.map((a) => a.invoiceId), context.tenantId);
    }

    return { data: entry };
  }

  async update(id: string, dto: UpdateBankEntryDto, context: CrudContext): Promise<{ data: BankEntryDto }> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Bank entry not found", 404);

    const updateData: any = {
      updatedBy: context.actorId ? { connect: { id: context.actorId } } : undefined,
    };

    if (dto.type) updateData.type = dto.type;
    if (dto.entryDate) updateData.entryDate = new Date(dto.entryDate);
    if (dto.slipRecNo !== undefined) updateData.slipRecNo = dto.slipRecNo;
    if (dto.bankName) updateData.bankName = dto.bankName;
    if (dto.partyId) updateData.party = { connect: { id: dto.partyId } };
    if (dto.chequeNo !== undefined) updateData.chequeNo = dto.chequeNo;
    if (dto.chequeDate !== undefined) updateData.chequeDate = dto.chequeDate ? new Date(dto.chequeDate) : null;
    if (dto.remarks !== undefined) updateData.remarks = dto.remarks;

    const amount = dto.amount ?? existing.amount;
    if (dto.amount !== undefined) updateData.amount = dto.amount;

    const billWisePayment = dto.billWisePayment ?? existing.billWisePayment;
    if (dto.billWisePayment !== undefined) updateData.billWisePayment = dto.billWisePayment;

    const oldAdjustedInvoiceIds = existing.adjustments.map((a) => a.invoiceId);

    if (dto.adjustments !== undefined) {
      const adjustments = dto.adjustments;
      const totalAdjusted = adjustments.reduce((sum, a) => sum + a.amount, 0);

      if (billWisePayment && totalAdjusted > amount) {
        throw new AppError("Total adjustments cannot exceed entry amount", 400);
      }

      const partyId = dto.partyId ?? existing.partyId;
      if (billWisePayment && adjustments.length > 0) {
        await this.validateAdjustments(adjustments, partyId, context.tenantId, id);
      }

      updateData.unadjustedAmount = amount - totalAdjusted;
      updateData.adjustments = {
        deleteMany: {},
        create: adjustments.map((a) => ({
          invoice: { connect: { id: a.invoiceId } },
          amount: a.amount,
        })),
      };
    } else if (dto.amount !== undefined) {
      const currentAdjusted = existing.adjustments.reduce((sum, a) => sum + a.amount, 0);
      updateData.unadjustedAmount = amount - currentAdjusted;
    }

    const entry = await this.repository.update(id, updateData);

    if (dto.adjustments !== undefined) {
      const newInvoiceIds = dto.adjustments.map((a) => a.invoiceId);
      const allInvoiceIds = [...new Set([...oldAdjustedInvoiceIds, ...newInvoiceIds])];
      if (allInvoiceIds.length > 0) {
        await this.updateInvoicePaymentStatuses(allInvoiceIds, context.tenantId);
      }
    }

    return { data: entry };
  }

  async remove(id: string, context: CrudContext): Promise<void> {
    const existing = await this.repository.findById(id, context.tenantId);
    if (!existing) throw new AppError("Bank entry not found", 404);

    const adjustedInvoiceIds = existing.adjustments.map((a) => a.invoiceId);

    await prisma.bankEntryAdjustment.deleteMany({ where: { bankEntryId: id } });
    await this.repository.softDelete(id, context.tenantId);

    if (adjustedInvoiceIds.length > 0) {
      await this.updateInvoicePaymentStatuses(adjustedInvoiceIds, context.tenantId);
    }
  }

  private async validateAdjustments(
    adjustments: { invoiceId: string; amount: number }[],
    partyId: string,
    tenantId: string,
    excludeBankEntryId?: string
  ): Promise<void> {
    for (const adj of adjustments) {
      const invoice = await prisma.invoice.findFirst({
        where: { id: adj.invoiceId, tenantId, partyId, deletedAt: null },
        select: {
          id: true,
          grandTotal: true,
          paidAmount: true,
          bankEntryAdjustments: {
            where: excludeBankEntryId ? { bankEntryId: { not: excludeBankEntryId } } : undefined,
            select: { amount: true },
          },
        },
      });

      if (!invoice) {
        throw new AppError(`Invoice ${adj.invoiceId} not found or does not belong to this party`, 400);
      }

      const grandTotal = formatDecimalValue(invoice.grandTotal);
      const paidAmount = formatDecimalValue(invoice.paidAmount);
      const existingAdjustments = invoice.bankEntryAdjustments.reduce(
        (sum: number, a: { amount: any }) => sum + formatDecimalValue(a.amount),
        0
      );
      const balance = grandTotal - paidAmount - existingAdjustments;

      if (adj.amount > balance + 0.01) {
        throw new AppError(
          `Adjustment amount ${adj.amount} exceeds invoice balance ${balance.toFixed(2)}`,
          400
        );
      }
    }
  }

  private async updateInvoicePaymentStatuses(invoiceIds: string[], tenantId: string): Promise<void> {
    for (const invoiceId of invoiceIds) {
      const invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, tenantId, deletedAt: null },
        select: {
          id: true,
          grandTotal: true,
          paidAmount: true,
          payments: { where: { deletedAt: null }, select: { amount: true } },
          bankEntryAdjustments: {
            where: { bankEntry: { deletedAt: null } },
            select: { amount: true },
          },
        },
      });

      if (!invoice) continue;

      const grandTotal = formatDecimalValue(invoice.grandTotal);
      const totalPayments = invoice.payments.reduce((sum: number, p: { amount: any }) => sum + formatDecimalValue(p.amount), 0);
      const totalAdjustments = invoice.bankEntryAdjustments.reduce(
        (sum: number, a: { amount: any }) => sum + formatDecimalValue(a.amount),
        0
      );
      const totalPaid = totalPayments + totalAdjustments;

      let paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
      if (totalPaid <= 0) {
        paymentStatus = "UNPAID";
      } else if (totalPaid >= grandTotal - 0.01) {
        paymentStatus = "PAID";
      } else {
        paymentStatus = "PARTIAL";
      }

      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: totalPaid,
          balanceAmount: Math.max(0, grandTotal - totalPaid),
          paymentStatus,
          status: paymentStatus === "PAID" ? "PAID" : undefined,
        },
      });
    }
  }
}
