import { prisma } from "../lib/prisma.js";

function currentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

export const DashboardService = {
  async getStats(tenantId: string) {
    const { start, end } = currentMonthRange();
    const now = new Date();

    const [
      partyCount,
      productCount,
      invoiceAgg,
      challanAgg,
      outstandingAgg,
      recentInvoices,
      recentChallans,
      overdueInvoices,
    ] = await Promise.all([
      prisma.party.count({ where: { tenantId, deletedAt: null } }),
      prisma.product.count({ where: { tenantId, deletedAt: null } }),
      prisma.invoice.aggregate({
        where: { tenantId, deletedAt: null, issueDate: { gte: start, lt: end } },
        _count: true,
        _sum: { grandTotal: true },
      }),
      prisma.challan.aggregate({
        where: { tenantId, deletedAt: null, issueDate: { gte: start, lt: end } },
        _count: true,
        _sum: { grandTotal: true },
      }),
      prisma.invoice.aggregate({
        where: {
          tenantId,
          deletedAt: null,
          paymentStatus: { in: ["UNPAID", "PARTIAL"] },
          status: { notIn: ["CANCELLED", "DRAFT"] },
        },
        _count: true,
        _sum: { balanceAmount: true },
      }),
      prisma.invoice.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          invoiceNumber: true,
          grandTotal: true,
          issueDate: true,
          status: true,
          party: { select: { name: true } },
        },
      }),
      prisma.challan.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          challanNumber: true,
          grandTotal: true,
          issueDate: true,
          status: true,
          party: { select: { name: true } },
        },
      }),
      prisma.invoice.findMany({
        where: {
          tenantId,
          deletedAt: null,
          dueDate: { lt: now },
          paymentStatus: { in: ["UNPAID", "PARTIAL"] },
          status: { notIn: ["CANCELLED", "DRAFT"] },
        },
        orderBy: { dueDate: "asc" },
        take: 10,
        select: {
          id: true,
          invoiceNumber: true,
          grandTotal: true,
          issueDate: true,
          dueDate: true,
          balanceAmount: true,
          status: true,
          party: { select: { name: true } },
        },
      }),
    ]);

    return {
      summary: {
        totalParties: partyCount,
        totalProducts: productCount,
        invoicesThisMonth: {
          count: invoiceAgg._count,
          totalAmount: Number(invoiceAgg._sum.grandTotal ?? 0),
        },
        challansThisMonth: {
          count: challanAgg._count,
          totalAmount: Number(challanAgg._sum.grandTotal ?? 0),
        },
      },
      outstanding: {
        count: outstandingAgg._count,
        totalBalance: Number(outstandingAgg._sum.balanceAmount ?? 0),
      },
      recentInvoices: recentInvoices.map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        partyName: inv.party.name,
        grandTotal: Number(inv.grandTotal),
        issueDate: inv.issueDate.toISOString(),
        status: inv.status,
      })),
      recentChallans: recentChallans.map((ch: any) => ({
        id: ch.id,
        challanNumber: ch.challanNumber,
        partyName: ch.party.name,
        grandTotal: Number(ch.grandTotal),
        issueDate: ch.issueDate.toISOString(),
        status: ch.status,
      })),
      overdueInvoices: overdueInvoices.map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        partyName: inv.party.name,
        grandTotal: Number(inv.grandTotal),
        issueDate: inv.issueDate.toISOString(),
        dueDate: inv.dueDate!.toISOString(),
        balanceAmount: Number(inv.balanceAmount),
        status: inv.status,
      })),
    };
  },
};
