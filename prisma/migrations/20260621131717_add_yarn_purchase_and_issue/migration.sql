-- CreateTable
CREATE TABLE "YarnPurchase" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billNo" TEXT,
    "billDate" TIMESTAMP(3),
    "partyId" TEXT NOT NULL,
    "billType" TEXT NOT NULL DEFAULT 'PURCHASE ACCOUNT',
    "totalCartons" INTEGER NOT NULL DEFAULT 0,
    "totalCheese" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalGrossWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalTareWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalNetWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "igstRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "igstAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "cgstRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "cgstAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sgstRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sgstAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "billAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "adjustedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "gstReceived" BOOLEAN NOT NULL DEFAULT false,
    "billRemarks" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "YarnPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnPurchaseItem" (
    "id" TEXT NOT NULL,
    "yarnPurchaseId" TEXT NOT NULL,
    "cartonNo" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "shadeName" TEXT,
    "lotNo" TEXT,
    "denier" TEXT,
    "twist" TEXT,
    "twistDirection" TEXT,
    "cheese" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "grossWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tareWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "netWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "rate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YarnPurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnIssue" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slipNo" TEXT NOT NULL,
    "cartonNo" TEXT NOT NULL,
    "yarnName" TEXT,
    "lotNo" TEXT,
    "twistDirection" TEXT,
    "cheese" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "netWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "shadeName" TEXT,
    "deptName" TEXT NOT NULL DEFAULT 'MAIN STORE',
    "remarks" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "YarnIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "YarnPurchase_tenantId_idx" ON "YarnPurchase"("tenantId");

-- CreateIndex
CREATE INDEX "YarnPurchase_tenantId_deletedAt_idx" ON "YarnPurchase"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "YarnPurchase_partyId_idx" ON "YarnPurchase"("partyId");

-- CreateIndex
CREATE INDEX "YarnPurchase_purchaseDate_idx" ON "YarnPurchase"("purchaseDate");

-- CreateIndex
CREATE UNIQUE INDEX "YarnPurchase_tenantId_serialNumber_key" ON "YarnPurchase"("tenantId", "serialNumber");

-- CreateIndex
CREATE INDEX "YarnPurchaseItem_yarnPurchaseId_idx" ON "YarnPurchaseItem"("yarnPurchaseId");

-- CreateIndex
CREATE INDEX "YarnPurchaseItem_cartonNo_idx" ON "YarnPurchaseItem"("cartonNo");

-- CreateIndex
CREATE UNIQUE INDEX "YarnPurchaseItem_yarnPurchaseId_cartonNo_key" ON "YarnPurchaseItem"("yarnPurchaseId", "cartonNo");

-- CreateIndex
CREATE INDEX "YarnIssue_tenantId_idx" ON "YarnIssue"("tenantId");

-- CreateIndex
CREATE INDEX "YarnIssue_tenantId_deletedAt_idx" ON "YarnIssue"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "YarnIssue_cartonNo_idx" ON "YarnIssue"("cartonNo");

-- CreateIndex
CREATE INDEX "YarnIssue_issueDate_idx" ON "YarnIssue"("issueDate");

-- CreateIndex
CREATE UNIQUE INDEX "YarnIssue_tenantId_slipNo_key" ON "YarnIssue"("tenantId", "slipNo");

-- AddForeignKey
ALTER TABLE "YarnPurchase" ADD CONSTRAINT "YarnPurchase_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnPurchase" ADD CONSTRAINT "YarnPurchase_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnPurchase" ADD CONSTRAINT "YarnPurchase_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnPurchase" ADD CONSTRAINT "YarnPurchase_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnPurchaseItem" ADD CONSTRAINT "YarnPurchaseItem_yarnPurchaseId_fkey" FOREIGN KEY ("yarnPurchaseId") REFERENCES "YarnPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnIssue" ADD CONSTRAINT "YarnIssue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnIssue" ADD CONSTRAINT "YarnIssue_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnIssue" ADD CONSTRAINT "YarnIssue_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
