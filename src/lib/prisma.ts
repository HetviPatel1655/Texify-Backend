import { PrismaClient } from "@prisma/client";

import { logger } from "./logger";
import { getCurrentTenantId } from "./tenant-context";

const TENANT_SCOPED_MODELS: ReadonlySet<string> = new Set([
  "CompanyProfile",
  "SystemSetting",
  "Party",
  "Product",
  "Invoice",
  "Challan",
  "Payment",
  "Subscription",
  "PurchaseOrder",
  "SaleOrder",
  "YarnPurchase",
  "YarnIssue",
  "Beam",
  "BeamSendJobwork",
  "Taka",
  "GreyTP",
  "ReturnTaka",
  "ChallanTakaEntry",
  "ChallanBeamEntry",
  "ChallanYarnEntry",
  "YarnSendJobwork",
  "YarnReceiveJobwork",
  "PaletteSendJobwork",
  "RollsSendJobwork",
  "TakaReceiveJobwork",
  "BankEntry",
  "Employee",
  "Attendance",
]);

const READ_OPS = new Set([
  "findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow",
  "findMany", "count", "aggregate", "groupBy",
]);

const WRITE_OPS = new Set([
  "update", "updateMany", "delete", "deleteMany",
]);

function hasTenantId(obj: any): boolean {
  if (!obj) return false;
  if (typeof obj.tenantId === "string") return true;
  if (obj.tenant?.connect?.id) return true;
  return false;
}

function resolveTenantId(args: any, operation: string): string {
  const asyncTenantId = getCurrentTenantId();

  if (operation === "create" || operation === "createMany" || operation === "createManyAndReturn" || operation === "upsert") {
    const data = operation === "upsert" ? args?.create : args?.data;
    if (Array.isArray(data)) {
      const first = data[0];
      return asyncTenantId ?? first?.tenantId ?? null;
    }
    return asyncTenantId ?? data?.tenantId ?? data?.tenant?.connect?.id ?? null;
  }

  return asyncTenantId ?? args?.where?.tenantId ?? null;
}

function withTenantScope(basePrisma: PrismaClient): PrismaClient {
  return (basePrisma as any).$extends({
    query: {
      $allOperations({ model, operation, args, query }: { model?: string; operation: string; args: any; query: (args: any) => any }) {
        if (!model || !TENANT_SCOPED_MODELS.has(model)) {
          return query(args);
        }

        const tenantId = resolveTenantId(args, operation);

        if (!tenantId) {
          throw new Error(
            `TENANT ISOLATION VIOLATION: ${model}.${operation}() called without tenantId. ` +
            `This query would return/modify data across all tenants.`
          );
        }

        if (READ_OPS.has(operation)) {
          args.where = { ...args.where, tenantId };
        } else if (WRITE_OPS.has(operation)) {
          args.where = { ...args.where, tenantId };
        } else if (operation === "create") {
          args.data = args.data ?? {};
          if (!hasTenantId(args.data)) {
            args.data.tenantId = tenantId;
          }
        } else if (operation === "createMany" || operation === "createManyAndReturn") {
          if (Array.isArray(args.data)) {
            args.data = args.data.map((d: any) => ({
              ...d,
              tenantId: d.tenantId ?? tenantId,
            }));
          } else if (args.data) {
            args.data.tenantId = args.data.tenantId ?? tenantId;
          }
        } else if (operation === "upsert") {
          args.where = { ...args.where, tenantId };
          args.create = args.create ?? {};
          if (!hasTenantId(args.create)) {
            args.create.tenantId = tenantId;
          }
        }

        return query(args);
      },
    },
  });
}

const basePrisma = new PrismaClient({
  log: ["error", "warn"],
});

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? withTenantScope(basePrisma);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  logger.info("Prisma client disconnected");
}
