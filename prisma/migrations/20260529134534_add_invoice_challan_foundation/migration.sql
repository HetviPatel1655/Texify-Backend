/*
  Warnings:

  - You are about to drop the column `lineGstAmount` on the `ChallanItem` table. All the data in the column will be lost.
  - You are about to drop the column `lineSubtotal` on the `ChallanItem` table. All the data in the column will be lost.
  - You are about to drop the column `lineTotal` on the `ChallanItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `ChallanItem` table. All the data in the column will be lost.
  - You are about to drop the column `lineGstAmount` on the `InvoiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `lineSubtotal` on the `InvoiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `lineTotal` on the `InvoiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `InvoiceItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[seriesCode,sequenceNumber,fiscalYear]` on the table `Challan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[seriesCode,sequenceNumber,fiscalYear]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `grandTotal` to the `ChallanItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rate` to the `ChallanItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `ChallanItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxableAmount` to the `ChallanItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `ChallanItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grandTotal` to the `InvoiceItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rate` to the `InvoiceItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `InvoiceItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxableAmount` to the `InvoiceItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `InvoiceItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INVOICE', 'CHALLAN');

-- AlterTable
ALTER TABLE "Challan" ADD COLUMN     "documentType" "DocumentType" NOT NULL DEFAULT 'CHALLAN',
ADD COLUMN     "placeOfSupply" TEXT,
ADD COLUMN     "terms" TEXT,
ADD COLUMN     "transportMode" TEXT,
ADD COLUMN     "vehicleNumber" TEXT;

-- AlterTable
ALTER TABLE "ChallanItem" DROP COLUMN "lineGstAmount",
DROP COLUMN "lineSubtotal",
DROP COLUMN "lineTotal",
DROP COLUMN "unitPrice",
ADD COLUMN     "grandTotal" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "gstAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "rate" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "taxableAmount" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "unit" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "documentType" "DocumentType" NOT NULL DEFAULT 'INVOICE',
ADD COLUMN     "placeOfSupply" TEXT,
ADD COLUMN     "terms" TEXT,
ADD COLUMN     "transportMode" TEXT,
ADD COLUMN     "vehicleNumber" TEXT;

-- AlterTable
ALTER TABLE "InvoiceItem" DROP COLUMN "lineGstAmount",
DROP COLUMN "lineSubtotal",
DROP COLUMN "lineTotal",
DROP COLUMN "unitPrice",
ADD COLUMN     "grandTotal" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "gstAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "rate" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "taxableAmount" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "unit" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Challan_seriesCode_fiscalYear_idx" ON "Challan"("seriesCode", "fiscalYear");

-- CreateIndex
CREATE INDEX "Challan_partyId_issueDate_idx" ON "Challan"("partyId", "issueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Challan_seriesCode_sequenceNumber_fiscalYear_key" ON "Challan"("seriesCode", "sequenceNumber", "fiscalYear");

-- CreateIndex
CREATE INDEX "Invoice_seriesCode_fiscalYear_idx" ON "Invoice"("seriesCode", "fiscalYear");

-- CreateIndex
CREATE INDEX "Invoice_partyId_issueDate_idx" ON "Invoice"("partyId", "issueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_seriesCode_sequenceNumber_fiscalYear_key" ON "Invoice"("seriesCode", "sequenceNumber", "fiscalYear");

-- CreateIndex
CREATE INDEX "Party_isActive_idx" ON "Party"("isActive");

-- CreateIndex
CREATE INDEX "Party_isActive_deletedAt_idx" ON "Party"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "Party_partyType_isActive_idx" ON "Party"("partyType", "isActive");

-- CreateIndex
CREATE INDEX "Product_unitType_idx" ON "Product"("unitType");

-- CreateIndex
CREATE INDEX "Product_gstType_idx" ON "Product"("gstType");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE INDEX "Product_isActive_deletedAt_idx" ON "Product"("isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "Product_unitType_isActive_idx" ON "Product"("unitType", "isActive");
