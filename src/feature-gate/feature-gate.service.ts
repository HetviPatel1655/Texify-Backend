import { prisma } from "../lib/prisma";
import { AppError } from "../common/errors/appError";

export type Feature =
  | "parties:create"
  | "invoices:create"
  | "challans:create"
  | "gstin:lookup"
  | "pdf:download";

function gstinMonthlyKey(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `gstin_lookups_${y}-${m}`;
}

interface PlanLimits {
  maxParties: number;
  maxInvoicesPerMonth: number;
  maxChallansPerMonth: number;
  maxGstinLookupsPerMonth: number;
  pdfExport: boolean;
}

const FREE_LIMITS: PlanLimits = {
  maxParties: 5,
  maxInvoicesPerMonth: 10,
  maxChallansPerMonth: 10,
  maxGstinLookupsPerMonth: 5,
  pdfExport: false,
};

const PRO_LIMITS: PlanLimits = {
  maxParties: Infinity,
  maxInvoicesPerMonth: Infinity,
  maxChallansPerMonth: Infinity,
  maxGstinLookupsPerMonth: Infinity,
  pdfExport: true,
};

function getLimits(planName: string | null): PlanLimits {
  if (planName === "pro") return PRO_LIMITS;
  return FREE_LIMITS;
}

async function getActivePlan(tenantId: string): Promise<string | null> {
  const sub = await prisma.subscription.findUnique({
    where: { tenantId },
    select: { status: true, planName: true },
  });

  if (sub && (sub.status === "ACTIVE" || sub.status === "AUTHENTICATED")) return sub.planName;
  return null;
}

function currentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

export const FeatureGateService = {
  async checkFeature(tenantId: string, feature: Feature): Promise<void> {
    const planName = await getActivePlan(tenantId);
    const limits = getLimits(planName);

    switch (feature) {
      case "parties:create": {
        const count = await prisma.party.count({
          where: { tenantId, deletedAt: null },
        });
        if (count >= limits.maxParties) {
          throw new AppError(
            `Free plan allows up to ${limits.maxParties} parties. Upgrade to Pro for unlimited parties.`,
            403,
            true,
            "LIMIT_EXCEEDED",
            { feature, limit: limits.maxParties, current: count },
          );
        }
        break;
      }

      case "invoices:create": {
        const { start, end } = currentMonthRange();
        const count = await prisma.invoice.count({
          where: { tenantId, deletedAt: null, createdAt: { gte: start, lt: end } },
        });
        if (count >= limits.maxInvoicesPerMonth) {
          throw new AppError(
            `Free plan allows up to ${limits.maxInvoicesPerMonth} invoices per month. Upgrade to Pro for unlimited invoices.`,
            403,
            true,
            "LIMIT_EXCEEDED",
            { feature, limit: limits.maxInvoicesPerMonth, current: count },
          );
        }
        break;
      }

      case "challans:create": {
        const { start, end } = currentMonthRange();
        const count = await prisma.challan.count({
          where: { tenantId, deletedAt: null, createdAt: { gte: start, lt: end } },
        });
        if (count >= limits.maxChallansPerMonth) {
          throw new AppError(
            `Free plan allows up to ${limits.maxChallansPerMonth} challans per month. Upgrade to Pro for unlimited challans.`,
            403,
            true,
            "LIMIT_EXCEEDED",
            { feature, limit: limits.maxChallansPerMonth, current: count },
          );
        }
        break;
      }

      case "gstin:lookup": {
        const key = gstinMonthlyKey();
        const row = await prisma.systemSetting.findFirst({ where: { tenantId, key } });
        const count = row ? parseInt(row.value, 10) || 0 : 0;
        if (count >= limits.maxGstinLookupsPerMonth) {
          throw new AppError(
            `Free plan allows up to ${limits.maxGstinLookupsPerMonth} GSTIN lookups per month. Upgrade to Pro for unlimited lookups.`,
            403,
            true,
            "LIMIT_EXCEEDED",
            { feature, limit: limits.maxGstinLookupsPerMonth, current: count },
          );
        }
        break;
      }

      case "pdf:download": {
        if (!limits.pdfExport) {
          throw new AppError(
            "PDF export is available on the Pro plan. Upgrade to download PDFs.",
            403,
            true,
            "LIMIT_EXCEEDED",
            { feature },
          );
        }
        break;
      }
    }
  },

  async incrementGstinLookups(tenantId: string): Promise<void> {
    const key = gstinMonthlyKey();
    const existing = await prisma.systemSetting.findFirst({ where: { tenantId, key } });
    if (existing) {
      const current = parseInt(existing.value, 10) || 0;
      await prisma.systemSetting.update({ where: { id: existing.id }, data: { value: String(current + 1) } });
    } else {
      await prisma.systemSetting.create({ data: { tenantId, key, value: "1" } });
    }
  },

  async getUsage(tenantId: string) {
    const planName = await getActivePlan(tenantId);
    const limits = getLimits(planName);
    const { start, end } = currentMonthRange();

    const gstinKey = gstinMonthlyKey();
    const [partyCount, invoiceCount, challanCount, gstinRow] = await Promise.all([
      prisma.party.count({ where: { tenantId, deletedAt: null } }),
      prisma.invoice.count({ where: { tenantId, deletedAt: null, createdAt: { gte: start, lt: end } } }),
      prisma.challan.count({ where: { tenantId, deletedAt: null, createdAt: { gte: start, lt: end } } }),
      prisma.systemSetting.findFirst({ where: { tenantId, key: gstinKey } }),
    ]);

    return {
      plan: planName ?? "free",
      limits: {
        parties: limits.maxParties === Infinity ? null : limits.maxParties,
        invoicesPerMonth: limits.maxInvoicesPerMonth === Infinity ? null : limits.maxInvoicesPerMonth,
        challansPerMonth: limits.maxChallansPerMonth === Infinity ? null : limits.maxChallansPerMonth,
        gstinLookupsPerMonth: limits.maxGstinLookupsPerMonth === Infinity ? null : limits.maxGstinLookupsPerMonth,
        pdfExport: limits.pdfExport,
      },
      usage: {
        parties: partyCount,
        invoicesThisMonth: invoiceCount,
        challansThisMonth: challanCount,
        gstinLookupsThisMonth: gstinRow ? parseInt(gstinRow.value, 10) || 0 : 0,
      },
    };
  },
};
