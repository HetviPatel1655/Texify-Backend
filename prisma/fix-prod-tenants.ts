import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TABLES_WITH_CREATED_BY = [
  "party", "product", "invoice", "challan", "payment",
  "purchaseOrder", "saleOrder", "yarnPurchase", "yarnIssue",
  "beam", "beamSendJobwork", "taka", "greyTP", "returnTaka",
  "yarnSendJobwork", "yarnReceiveJobwork", "paletteSendJobwork",
  "rollsSendJobwork", "takaReceiveJobwork", "bankEntry", "employee",
] as const;

const OLD_TENANT = "689774fc-8e00-43fc-b36c-950a9852f0d5";

async function main() {
  console.log("=== Production Tenant Isolation Fix ===\n");

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
  });

  const userTenantMap: Record<string, string> = {};

  for (const user of users) {
    const existingTUs = await prisma.tenantUser.findMany({
      where: { userId: user.id },
      select: { tenantId: true },
    });

    const hasOnlyOldTenant =
      existingTUs.length === 1 && existingTUs[0].tenantId === OLD_TENANT;
    const hasOldAndOther =
      existingTUs.length > 1 && existingTUs.some((t) => t.tenantId === OLD_TENANT);

    if (hasOnlyOldTenant) {
      const newTenant = await prisma.tenant.create({
        data: { name: `${user.name}'s Business` },
      });
      await prisma.tenantUser.updateMany({
        where: { userId: user.id, tenantId: OLD_TENANT },
        data: { tenantId: newTenant.id },
      });
      userTenantMap[user.id] = newTenant.id;
      console.log(`${user.email}: new tenant ${newTenant.id}`);
    } else if (hasOldAndOther) {
      const otherTenant = existingTUs.find((t) => t.tenantId !== OLD_TENANT)!;
      await prisma.tenantUser.deleteMany({
        where: { userId: user.id, tenantId: OLD_TENANT },
      });
      userTenantMap[user.id] = otherTenant.tenantId;
      console.log(`${user.email}: kept existing tenant ${otherTenant.tenantId}, removed old link`);
    } else {
      userTenantMap[user.id] = existingTUs[0]?.tenantId ?? "NONE";
      console.log(`${user.email}: no change (tenant ${userTenantMap[user.id]})`);
    }
  }

  console.log("\n--- Moving records ---");
  for (const table of TABLES_WITH_CREATED_BY) {
    const model = (prisma as any)[table];
    if (!model) continue;

    for (const [userId, newTenantId] of Object.entries(userTenantMap)) {
      try {
        const result = await model.updateMany({
          where: { tenantId: OLD_TENANT, createdById: userId },
          data: { tenantId: newTenantId },
        });
        if (result.count > 0) {
          const email = users.find((u) => u.id === userId)?.email;
          console.log(`  ${table}: moved ${result.count} records -> ${email}`);
        }
      } catch {
        // skip tables that don't match expected schema
      }
    }
  }

  // Move child records (challanItem, invoiceItem) based on parent's new tenantId
  // These don't have createdById, but their parent challan/invoice was already moved
  // ChallanItem and InvoiceItem don't have tenantId at all — they inherit from parent
  // So nothing to do for them.

  // Move company profile — each user who created one should get it
  // Actually company profiles are shared per tenant, leave them in old tenant or just check
  const companyProfiles = await prisma.companyProfile.findMany({
    where: { tenantId: OLD_TENANT },
  });
  if (companyProfiles.length > 0) {
    console.log(`\n  companyProfile: ${companyProfiles.length} still in old tenant — not moving (each user creates their own)`);
  }

  // Move system settings
  const settings = await prisma.systemSetting.findMany({
    where: { tenantId: OLD_TENANT },
  });
  if (settings.length > 0) {
    console.log(`  systemSetting: ${settings.length} still in old tenant — not moving`);
  }

  // Verify: check what's left in old tenant
  console.log("\n--- Orphan check (old tenant) ---");
  let anyOrphans = false;
  for (const table of TABLES_WITH_CREATED_BY) {
    const model = (prisma as any)[table];
    if (!model) continue;
    try {
      const count = await model.count({ where: { tenantId: OLD_TENANT } });
      if (count > 0) {
        console.log(`  ${table}: ${count} orphaned`);
        anyOrphans = true;
      }
    } catch {}
  }
  if (!anyOrphans) console.log("  None! All records moved.");

  // Clean up remaining tenant-user links to old tenant
  const remainingLinks = await prisma.tenantUser.count({
    where: { tenantId: OLD_TENANT },
  });
  if (remainingLinks > 0) {
    console.log(`\nRemoving ${remainingLinks} leftover old tenant-user links...`);
    await prisma.tenantUser.deleteMany({ where: { tenantId: OLD_TENANT } });
  }

  // Final state
  console.log("\n=== Final State ===");
  for (const user of users) {
    const tus = await prisma.tenantUser.findMany({
      where: { userId: user.id },
      select: { tenantId: true },
    });
    console.log(`${user.email}: ${JSON.stringify(tus.map((t: any) => t.tenantId))}`);
  }

  console.log("\n=== Done ===");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
