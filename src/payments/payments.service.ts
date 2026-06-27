import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../common/errors/appError";
import { formatDecimalValue } from "../common/utils/decimal";
import type { RecordPaymentDto, PaymentDto } from "./payments.types";

interface PaymentContext {
  actorId: string;
  tenantId: string;
}

function toDto(payment: any): PaymentDto {
  return {
    id: payment.id,
    invoiceId: payment.invoiceId,
    amount: formatDecimalValue(payment.amount),
    method: payment.method,
    referenceNo: payment.referenceNo,
    paymentDate: payment.paymentDate?.toISOString() ?? payment.paymentDate,
    notes: payment.notes,
    createdAt: payment.createdAt?.toISOString() ?? payment.createdAt,
    createdById: payment.createdById,
  };
}

export class PaymentsService {
  async recordPayment(invoiceId: string, dto: RecordPaymentDto, context: PaymentContext): Promise<PaymentDto> {
    return prisma.$transaction(async (tx) => {
      const db = tx as any;

      const invoice = await db.invoice.findFirst({
        where: { id: invoiceId, tenantId: context.tenantId, deletedAt: null },
        select: { id: true, status: true, balanceAmount: true, paidAmount: true },
      });

      if (!invoice) throw new AppError("Invoice not found", 404);
      if (invoice.status === "CANCELLED") throw new AppError("Cannot record payment on a cancelled invoice", 400);

      const balance = new Prisma.Decimal(invoice.balanceAmount);
      const amount = new Prisma.Decimal(dto.amount);

      if (amount.greaterThan(balance)) {
        throw new AppError(`Amount exceeds balance due (${formatDecimalValue(balance)})`, 400);
      }

      const newPaid = new Prisma.Decimal(invoice.paidAmount).add(amount);
      const newBalance = balance.sub(amount);
      const paymentStatus = newBalance.isZero() ? "PAID" : "PARTIAL";

      const payment = await db.payment.create({
        data: {
          tenantId: context.tenantId,
          invoiceId,
          amount,
          method: dto.method,
          referenceNo: dto.referenceNo ?? null,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
          notes: dto.notes ?? null,
          createdById: context.actorId,
        },
      });

      await db.invoice.update({
        where: { id: invoiceId },
        data: { paidAmount: newPaid, balanceAmount: newBalance, paymentStatus },
      });

      return toDto(payment);
    });
  }

  async listPayments(invoiceId: string, tenantId: string): Promise<PaymentDto[]> {
    const payments = await prisma.payment.findMany({
      where: { invoiceId, tenantId, deletedAt: null },
      orderBy: { paymentDate: "desc" },
    });

    return payments.map(toDto);
  }

  async deletePayment(paymentId: string, invoiceId: string, context: PaymentContext): Promise<void> {
    return prisma.$transaction(async (tx) => {
      const db = tx as any;

      const payment = await db.payment.findFirst({
        where: { id: paymentId, invoiceId, tenantId: context.tenantId, deletedAt: null },
      });

      if (!payment) throw new AppError("Payment not found", 404);

      await db.payment.update({
        where: { id: paymentId },
        data: { deletedAt: new Date() },
      });

      const invoice = await db.invoice.findFirst({
        where: { id: invoiceId },
        select: { paidAmount: true, balanceAmount: true },
      });

      const newPaid = new Prisma.Decimal(invoice.paidAmount).sub(payment.amount);
      const newBalance = new Prisma.Decimal(invoice.balanceAmount).add(payment.amount);
      const paymentStatus = newPaid.isZero() ? "UNPAID" : "PARTIAL";

      await db.invoice.update({
        where: { id: invoiceId },
        data: { paidAmount: newPaid, balanceAmount: newBalance, paymentStatus },
      });
    });
  }
}
