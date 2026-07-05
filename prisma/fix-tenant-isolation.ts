import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TENANT_SCOPED_TABLES = [
  "party",
  "product",
  "invoice",
  "challan",
  "payment",
  "purchaseOrder",
  "saleOrder",
  "yarnPurchase",
  "yarnIssue",
  "beam",
  "beamSendJobwork",
  "taka",
  "greyTP",
  "returnTaka",
  "challanTakaEntry",
  "challanBeamEntry",
  "challanYarnEntry",
  "yarnSendJobwork",
  "yarnReceiveJobwork",
  "paletteSendJobwork",
  "rollsSendJobwork",
  "takaReceiveJobwork",
  "bankEntry",
  "employee",
] as const;

async function main() {
  console.log("=== Tenant Isolation Data Fix ===\n");

  const tenantUsers = await prisma.tenantUser.findMany({
    select: { userId: true, tenantId: true },
    orderBy: { createdAt: "asc" },
  });

  const userToTenant = new Map<string, string>();
  for (const tu of tenantUsers) {
    if (!userToTenant.has(tu.userId)) {
      userToTenant.set(tu.userId, tu.tenantId);
    }
  }

  console.log(`Found ${userToTenant.size} users with tenant mappings:\n`);
  for (const [userId, tenantId] of userToTenant) {
    console.log(`  User ${userId} → Tenant ${tenantId}`);
  }
  console.log();

  let totalFixed = 0;

  for (const table of TENANT_SCOPED_TABLES) {
    const model = (prisma as any)[table];
    if (!model) {
      console.log(`⚠ Model "${table}" not found, skipping`);
      continue;
    }

    const records = await model.findMany({
      select: { id: true, tenantId: true, createdById: true },
    });

    let fixedInTable = 0;

    for (const record of records) {
      if (!record.createdById) continue;

      const correctTenantId = userToTenant.get(record.createdById);
      if (!correctTenantId) continue;

      if (record.tenantId !== correctTenantId) {
        await model.update({
          where: { id: record.id },
          data: { tenantId: correctTenantId },
        });
        fixedInTable++;
      }
    }

    if (fixedInTable > 0) {
      console.log(`✓ ${table}: fixed ${fixedInTable} / ${records.length} records`);
      totalFixed += fixedInTable;
    } else {
      console.log(`  ${table}: ${records.length} records — all correct`);
    }
  }

  // Fix attendance records (no createdById, linked via employee)
  const employees = await prisma.employee.findMany({
    select: { id: true, tenantId: true },
  });
  const employeeToTenant = new Map(employees.map((e: any) => [e.id, e.tenantId]));

  const attendances = await prisma.attendance.findMany({
    select: { id: true, tenantId: true, employeeId: true },
  });

  let attendanceFixed = 0;
  for (const att of attendances) {
    const correctTenantId = employeeToTenant.get(att.employeeId);
    if (correctTenantId && att.tenantId !== correctTenantId) {
      await prisma.attendance.update({
        where: { id: att.id },
        data: { tenantId: correctTenantId },
      });
      attendanceFixed++;
    }
  }
  if (attendanceFixed > 0) {
    console.log(`✓ attendance: fixed ${attendanceFixed} / ${attendances.length} records`);
    totalFixed += attendanceFixed;
  } else {
    console.log(`  attendance: ${attendances.length} records — all correct`);
  }

  console.log(`\n=== Done. Fixed ${totalFixed} records total. ===`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
