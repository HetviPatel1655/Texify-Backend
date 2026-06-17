-- Step 1: Create Tenant and TenantUser tables
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TenantUser" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantUser_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "TenantUser_tenantId_userId_key" ON "TenantUser"("tenantId", "userId");
CREATE INDEX "TenantUser_userId_idx" ON "TenantUser"("userId");

-- Step 2: Add nullable tenantId columns to all business models
ALTER TABLE "CompanyProfile" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Party" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Product" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Challan" ADD COLUMN "tenantId" TEXT;

-- SystemSetting: change PK from key to UUID id, add tenantId
ALTER TABLE "SystemSetting" DROP CONSTRAINT "SystemSetting_pkey";
ALTER TABLE "SystemSetting" ADD COLUMN "id" TEXT;
ALTER TABLE "SystemSetting" ADD COLUMN "tenantId" TEXT;

-- Step 3: Create default tenant and backfill all existing data
DO $$
DECLARE
    default_tenant_id TEXT := gen_random_uuid()::TEXT;
BEGIN
    INSERT INTO "Tenant" ("id", "name", "createdAt", "updatedAt")
    VALUES (default_tenant_id, 'Default Business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Link all existing users to the default tenant
    INSERT INTO "TenantUser" ("id", "tenantId", "userId", "role", "createdAt")
    SELECT gen_random_uuid()::TEXT, default_tenant_id, "id", 'OWNER', CURRENT_TIMESTAMP
    FROM "User";

    -- Backfill tenantId on all business models
    UPDATE "CompanyProfile" SET "tenantId" = default_tenant_id;
    UPDATE "Party" SET "tenantId" = default_tenant_id;
    UPDATE "Product" SET "tenantId" = default_tenant_id;
    UPDATE "Invoice" SET "tenantId" = default_tenant_id;
    UPDATE "Challan" SET "tenantId" = default_tenant_id;

    -- Backfill SystemSetting
    UPDATE "SystemSetting" SET "tenantId" = default_tenant_id, "id" = gen_random_uuid()::TEXT;
END $$;

-- Step 4: Make tenantId NOT NULL
ALTER TABLE "CompanyProfile" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Party" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Invoice" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Challan" ALTER COLUMN "tenantId" SET NOT NULL;

-- SystemSetting: finalize PK change
UPDATE "SystemSetting" SET "id" = gen_random_uuid()::TEXT WHERE "id" IS NULL;
ALTER TABLE "SystemSetting" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "SystemSetting" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "SystemSetting" ADD CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id");

-- Step 5: Drop old unique constraints and add tenant-scoped ones

-- Party: code was globally unique, now tenant-scoped
DROP INDEX IF EXISTS "Party_code_key";
CREATE UNIQUE INDEX "Party_tenantId_code_key" ON "Party"("tenantId", "code");

-- Party: gstin was globally unique, now tenant-scoped
DROP INDEX IF EXISTS "Party_gstin_key";
CREATE UNIQUE INDEX "Party_tenantId_gstin_key" ON "Party"("tenantId", "gstin");

-- Product: sku was globally unique, now tenant-scoped
DROP INDEX IF EXISTS "Product_sku_key";
CREATE UNIQUE INDEX "Product_tenantId_sku_key" ON "Product"("tenantId", "sku");

-- Invoice: invoiceNumber was globally unique, now tenant-scoped
DROP INDEX IF EXISTS "Invoice_invoiceNumber_key";
CREATE UNIQUE INDEX "Invoice_tenantId_invoiceNumber_key" ON "Invoice"("tenantId", "invoiceNumber");

-- Invoice: composite unique now includes tenantId
DROP INDEX IF EXISTS "Invoice_seriesCode_sequenceNumber_fiscalYear_key";
CREATE UNIQUE INDEX "Invoice_tenantId_seriesCode_sequenceNumber_fiscalYear_key" ON "Invoice"("tenantId", "seriesCode", "sequenceNumber", "fiscalYear");

-- Challan: challanNumber was globally unique, now tenant-scoped
DROP INDEX IF EXISTS "Challan_challanNumber_key";
CREATE UNIQUE INDEX "Challan_tenantId_challanNumber_key" ON "Challan"("tenantId", "challanNumber");

-- Challan: composite unique now includes tenantId
DROP INDEX IF EXISTS "Challan_seriesCode_sequenceNumber_fiscalYear_key";
CREATE UNIQUE INDEX "Challan_tenantId_seriesCode_sequenceNumber_fiscalYear_key" ON "Challan"("tenantId", "seriesCode", "sequenceNumber", "fiscalYear");

-- CompanyProfile: one per tenant
CREATE UNIQUE INDEX "CompanyProfile_tenantId_key" ON "CompanyProfile"("tenantId");

-- SystemSetting: unique per tenant+key
CREATE UNIQUE INDEX "SystemSetting_tenantId_key_key" ON "SystemSetting"("tenantId", "key");

-- Step 6: Add FK constraints for tenantId
ALTER TABLE "CompanyProfile" ADD CONSTRAINT "CompanyProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Party" ADD CONSTRAINT "Party_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Challan" ADD CONSTRAINT "Challan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SystemSetting" ADD CONSTRAINT "SystemSetting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Add performance indexes
CREATE INDEX "CompanyProfile_tenantId_idx" ON "CompanyProfile"("tenantId");
CREATE INDEX "Party_tenantId_idx" ON "Party"("tenantId");
CREATE INDEX "Party_tenantId_deletedAt_idx" ON "Party"("tenantId", "deletedAt");
CREATE INDEX "Product_tenantId_idx" ON "Product"("tenantId");
CREATE INDEX "Product_tenantId_deletedAt_idx" ON "Product"("tenantId", "deletedAt");
CREATE INDEX "Invoice_tenantId_idx" ON "Invoice"("tenantId");
CREATE INDEX "Invoice_tenantId_deletedAt_idx" ON "Invoice"("tenantId", "deletedAt");
CREATE INDEX "Challan_tenantId_idx" ON "Challan"("tenantId");
CREATE INDEX "Challan_tenantId_deletedAt_idx" ON "Challan"("tenantId", "deletedAt");
CREATE INDEX "SystemSetting_tenantId_idx" ON "SystemSetting"("tenantId");
