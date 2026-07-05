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

function withTenantScope(basePrisma: PrismaClient): PrismaClient {
  return (basePrisma as any).$extends({
    query: {
      $allOperations({ model, operation, args, query }: { model?: string; operation: string; args: any; query: (args: any) => any }) {
        const tenantId = getCurrentTenantId();
        if (!tenantId || !model || !TENANT_SCOPED_MODELS.has(model)) {
          return query(args);
        }

        switch (operation) {
          case "findUnique":
          case "findUniqueOrThrow":
          case "findFirst":
          case "findFirstOrThrow":
          case "findMany":
          case "count":
          case "aggregate":
          case "groupBy":
            args.where = { ...args.where, tenantId };
            break;

          case "create":
            args.data = args.data ?? {};
            if (!args.data.tenantId) {
              args.data.tenantId = tenantId;
            }
            break;

          case "createMany":
          case "createManyAndReturn":
            if (Array.isArray(args.data)) {
              args.data = args.data.map((d: any) => ({
                ...d,
                tenantId: d.tenantId ?? tenantId,
              }));
            } else if (args.data) {
              args.data.tenantId = args.data.tenantId ?? tenantId;
            }
            break;

          case "update":
          case "updateMany":
          case "delete":
          case "deleteMany":
            args.where = { ...args.where, tenantId };
            break;

          case "upsert":
            args.where = { ...args.where, tenantId };
            args.create = args.create ?? {};
            if (!args.create.tenantId) {
              args.create.tenantId = tenantId;
            }
            break;
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
