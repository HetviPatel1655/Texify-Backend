-- AlterEnum
ALTER TYPE "UnitType" ADD VALUE 'TAKA';

-- AlterTable
ALTER TABLE "Challan" ADD COLUMN     "agentName" TEXT,
ADD COLUMN     "deliveryAddress1" TEXT,
ADD COLUMN     "deliveryAddress2" TEXT,
ADD COLUMN     "deliveryCity" TEXT,
ADD COLUMN     "deliveryGstin" TEXT,
ADD COLUMN     "deliveryPartyName" TEXT,
ADD COLUMN     "deliveryPhone" TEXT,
ADD COLUMN     "deliveryPostalCode" TEXT,
ADD COLUMN     "deliveryState" TEXT,
ADD COLUMN     "remark" TEXT,
ADD COLUMN     "totalMeters" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "totalTakas" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ChallanItem" ADD COLUMN     "hsnCode" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "agentName" TEXT,
ADD COLUMN     "bankAccountNo" TEXT,
ADD COLUMN     "bankBranch" TEXT,
ADD COLUMN     "bankIfsc" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "cgstAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "cgstRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "challanId" TEXT,
ADD COLUMN     "dueDays" INTEGER,
ADD COLUMN     "eWayBillNo" TEXT,
ADD COLUMN     "igstAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "igstRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "interestRate" DECIMAL(65,30),
ADD COLUMN     "lrNo" TEXT,
ADD COLUMN     "orderNo" TEXT,
ADD COLUMN     "remark" TEXT,
ADD COLUMN     "sgstAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "sgstRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "taxableAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "transporterName" TEXT;

-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "hsnCode" TEXT,
ADD COLUMN     "pieces" DECIMAL(65,30),
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Party" ADD COLUMN     "billingStateCode" TEXT,
ADD COLUMN     "panNo" TEXT,
ADD COLUMN     "shippingStateCode" TEXT;

-- CreateTable
CREATE TABLE "CompanyProfile" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "tagline" TEXT,
    "logoUrl" TEXT,
    "businessType" TEXT,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "phone" TEXT,
    "email" TEXT,
    "gstin" TEXT NOT NULL,
    "pan" TEXT,
    "msme" TEXT,
    "bankName" TEXT,
    "bankAccountNo" TEXT,
    "bankIfsc" TEXT,
    "bankBranch" TEXT,
    "defaultTerms" TEXT,
    "defaultNotes" TEXT,
    "interestRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "jurisdiction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallanRollEntry" (
    "id" TEXT NOT NULL,
    "challanItemId" TEXT NOT NULL,
    "serialNumber" INTEGER NOT NULL,
    "meters" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallanRollEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChallanRollEntry_challanItemId_idx" ON "ChallanRollEntry"("challanItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallanRollEntry_challanItemId_serialNumber_key" ON "ChallanRollEntry"("challanItemId", "serialNumber");

-- CreateIndex
CREATE INDEX "Invoice_challanId_idx" ON "Invoice"("challanId");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "Challan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanRollEntry" ADD CONSTRAINT "ChallanRollEntry_challanItemId_fkey" FOREIGN KEY ("challanItemId") REFERENCES "ChallanItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
