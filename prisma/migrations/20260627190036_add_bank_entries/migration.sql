-- CreateEnum
CREATE TYPE "BankEntryType" AS ENUM ('SLIP', 'CHEQUE');

-- CreateTable
CREATE TABLE "BankEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "type" "BankEntryType" NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slipRecNo" TEXT,
    "bankName" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "chequeNo" TEXT,
    "chequeDate" TIMESTAMP(3),
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "billWisePayment" BOOLEAN NOT NULL DEFAULT false,
    "unadjustedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "BankEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankEntryAdjustment" (
    "id" TEXT NOT NULL,
    "bankEntryId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "BankEntryAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BankEntry_tenantId_deletedAt_idx" ON "BankEntry"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "BankEntry_type_idx" ON "BankEntry"("type");

-- CreateIndex
CREATE INDEX "BankEntry_partyId_idx" ON "BankEntry"("partyId");

-- CreateIndex
CREATE INDEX "BankEntry_entryDate_idx" ON "BankEntry"("entryDate");

-- CreateIndex
CREATE UNIQUE INDEX "BankEntry_tenantId_serialNumber_key" ON "BankEntry"("tenantId", "serialNumber");

-- CreateIndex
CREATE INDEX "BankEntryAdjustment_bankEntryId_idx" ON "BankEntryAdjustment"("bankEntryId");

-- CreateIndex
CREATE INDEX "BankEntryAdjustment_invoiceId_idx" ON "BankEntryAdjustment"("invoiceId");

-- AddForeignKey
ALTER TABLE "BankEntry" ADD CONSTRAINT "BankEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankEntry" ADD CONSTRAINT "BankEntry_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankEntry" ADD CONSTRAINT "BankEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankEntry" ADD CONSTRAINT "BankEntry_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankEntryAdjustment" ADD CONSTRAINT "BankEntryAdjustment_bankEntryId_fkey" FOREIGN KEY ("bankEntryId") REFERENCES "BankEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankEntryAdjustment" ADD CONSTRAINT "BankEntryAdjustment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
