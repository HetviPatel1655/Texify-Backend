-- CreateEnum
CREATE TYPE "TakaStatus" AS ENUM ('IN_STOCK', 'SOLD', 'RETURNED', 'SENT_TO_JOBWORK', 'PROCESSING');

-- CreateTable
CREATE TABLE "Taka" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "takaNo" TEXT NOT NULL,
    "takaPrefix" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loomNo" TEXT,
    "beamId" TEXT,
    "firmId" TEXT,
    "itemName" TEXT,
    "grade" TEXT,
    "designNo" TEXT,
    "shadeName" TEXT,
    "meters" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "weight" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "avgWeightPerMeter" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "shouldBeWeight" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "weightDiff" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sarees" INTEGER NOT NULL DEFAULT 0,
    "pieces" INTEGER NOT NULL DEFAULT 0,
    "cut" TEXT,
    "workerName" TEXT,
    "foldingDate" TIMESTAMP(3),
    "startingDate" TIMESTAMP(3),
    "cuttingDate" TIMESTAMP(3),
    "salaryDate" TIMESTAMP(3),
    "wtPerMtr" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "TakaStatus" NOT NULL DEFAULT 'IN_STOCK',
    "isWithBeam" BOOLEAN NOT NULL DEFAULT false,
    "serialNoWiseTaka" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Taka_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GreyTP" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "takaId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "newMeters" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "originalMeters" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "newWeight" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "originalWeight" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "newSarees" INTEGER NOT NULL DEFAULT 0,
    "originalSarees" INTEGER NOT NULL DEFAULT 0,
    "remark" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "GreyTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnTaka" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "takaId" TEXT NOT NULL,
    "returnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partyId" TEXT,
    "challanNo" TEXT,
    "rate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "ReturnTaka_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Taka_tenantId_idx" ON "Taka"("tenantId");

-- CreateIndex
CREATE INDEX "Taka_tenantId_deletedAt_idx" ON "Taka"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "Taka_beamId_idx" ON "Taka"("beamId");

-- CreateIndex
CREATE INDEX "Taka_firmId_idx" ON "Taka"("firmId");

-- CreateIndex
CREATE INDEX "Taka_date_idx" ON "Taka"("date");

-- CreateIndex
CREATE INDEX "Taka_status_idx" ON "Taka"("status");

-- CreateIndex
CREATE INDEX "Taka_loomNo_idx" ON "Taka"("loomNo");

-- CreateIndex
CREATE INDEX "Taka_itemName_idx" ON "Taka"("itemName");

-- CreateIndex
CREATE UNIQUE INDEX "Taka_tenantId_takaNo_key" ON "Taka"("tenantId", "takaNo");

-- CreateIndex
CREATE INDEX "GreyTP_tenantId_idx" ON "GreyTP"("tenantId");

-- CreateIndex
CREATE INDEX "GreyTP_tenantId_deletedAt_idx" ON "GreyTP"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "GreyTP_takaId_idx" ON "GreyTP"("takaId");

-- CreateIndex
CREATE INDEX "GreyTP_date_idx" ON "GreyTP"("date");

-- CreateIndex
CREATE INDEX "ReturnTaka_tenantId_idx" ON "ReturnTaka"("tenantId");

-- CreateIndex
CREATE INDEX "ReturnTaka_tenantId_deletedAt_idx" ON "ReturnTaka"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "ReturnTaka_takaId_idx" ON "ReturnTaka"("takaId");

-- CreateIndex
CREATE INDEX "ReturnTaka_partyId_idx" ON "ReturnTaka"("partyId");

-- CreateIndex
CREATE INDEX "ReturnTaka_returnDate_idx" ON "ReturnTaka"("returnDate");

-- AddForeignKey
ALTER TABLE "Taka" ADD CONSTRAINT "Taka_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taka" ADD CONSTRAINT "Taka_beamId_fkey" FOREIGN KEY ("beamId") REFERENCES "Beam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taka" ADD CONSTRAINT "Taka_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taka" ADD CONSTRAINT "Taka_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taka" ADD CONSTRAINT "Taka_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GreyTP" ADD CONSTRAINT "GreyTP_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GreyTP" ADD CONSTRAINT "GreyTP_takaId_fkey" FOREIGN KEY ("takaId") REFERENCES "Taka"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GreyTP" ADD CONSTRAINT "GreyTP_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GreyTP" ADD CONSTRAINT "GreyTP_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnTaka" ADD CONSTRAINT "ReturnTaka_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnTaka" ADD CONSTRAINT "ReturnTaka_takaId_fkey" FOREIGN KEY ("takaId") REFERENCES "Taka"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnTaka" ADD CONSTRAINT "ReturnTaka_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnTaka" ADD CONSTRAINT "ReturnTaka_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnTaka" ADD CONSTRAINT "ReturnTaka_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
