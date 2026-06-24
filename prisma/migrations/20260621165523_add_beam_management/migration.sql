-- CreateEnum
CREATE TYPE "BeamStatus" AS ENUM ('NOT_LOADED', 'UNDER_PRODUCTION', 'SENT_TO_JOBWORK', 'BHIRAN_ONLY', 'UNDER_PRI_LOADED', 'BEAM_STOCK', 'BEAM_COMPLETED');

-- CreateTable
CREATE TABLE "Beam" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "beamNo" TEXT NOT NULL,
    "beamDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "beamPipeNo" TEXT,
    "itemName" TEXT,
    "yarnName" TEXT,
    "lotNo" TEXT,
    "ends" INTEGER NOT NULL DEFAULT 0,
    "takas" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "meters" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "grossWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tareWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "netWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "pootha" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "beamPosition" TEXT,
    "plannedMeters" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "plannedTakas" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "shortPercent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "bhiran" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "BeamStatus" NOT NULL DEFAULT 'NOT_LOADED',
    "partyId" TEXT,
    "warperName" TEXT,
    "loomNo" TEXT,
    "remarks" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Beam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeamSendJobwork" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "challanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "challanNo" TEXT,
    "firmId" TEXT,
    "partyId" TEXT,
    "totalBeamPipes" INTEGER NOT NULL DEFAULT 0,
    "totalTakas" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalMeters" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalGrossWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalTareWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalNetWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalPootha" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "goodsRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "goodsAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "BeamSendJobwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeamSendJobworkItem" (
    "id" TEXT NOT NULL,
    "beamSendJobworkId" TEXT NOT NULL,
    "beamId" TEXT,
    "beamNo" TEXT NOT NULL,
    "yarnName" TEXT,
    "lotNo" TEXT,
    "ends" INTEGER NOT NULL DEFAULT 0,
    "takas" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "meters" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "grossWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tareWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "netWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "pootha" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeamSendJobworkItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Beam_tenantId_idx" ON "Beam"("tenantId");

-- CreateIndex
CREATE INDEX "Beam_tenantId_deletedAt_idx" ON "Beam"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "Beam_partyId_idx" ON "Beam"("partyId");

-- CreateIndex
CREATE INDEX "Beam_beamDate_idx" ON "Beam"("beamDate");

-- CreateIndex
CREATE INDEX "Beam_status_idx" ON "Beam"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Beam_tenantId_beamNo_key" ON "Beam"("tenantId", "beamNo");

-- CreateIndex
CREATE INDEX "BeamSendJobwork_tenantId_idx" ON "BeamSendJobwork"("tenantId");

-- CreateIndex
CREATE INDEX "BeamSendJobwork_tenantId_deletedAt_idx" ON "BeamSendJobwork"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "BeamSendJobwork_firmId_idx" ON "BeamSendJobwork"("firmId");

-- CreateIndex
CREATE INDEX "BeamSendJobwork_partyId_idx" ON "BeamSendJobwork"("partyId");

-- CreateIndex
CREATE INDEX "BeamSendJobwork_challanDate_idx" ON "BeamSendJobwork"("challanDate");

-- CreateIndex
CREATE UNIQUE INDEX "BeamSendJobwork_tenantId_serialNumber_key" ON "BeamSendJobwork"("tenantId", "serialNumber");

-- CreateIndex
CREATE INDEX "BeamSendJobworkItem_beamSendJobworkId_idx" ON "BeamSendJobworkItem"("beamSendJobworkId");

-- CreateIndex
CREATE INDEX "BeamSendJobworkItem_beamId_idx" ON "BeamSendJobworkItem"("beamId");

-- AddForeignKey
ALTER TABLE "Beam" ADD CONSTRAINT "Beam_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beam" ADD CONSTRAINT "Beam_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beam" ADD CONSTRAINT "Beam_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beam" ADD CONSTRAINT "Beam_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeamSendJobwork" ADD CONSTRAINT "BeamSendJobwork_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeamSendJobwork" ADD CONSTRAINT "BeamSendJobwork_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeamSendJobwork" ADD CONSTRAINT "BeamSendJobwork_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeamSendJobwork" ADD CONSTRAINT "BeamSendJobwork_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeamSendJobwork" ADD CONSTRAINT "BeamSendJobwork_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeamSendJobworkItem" ADD CONSTRAINT "BeamSendJobworkItem_beamSendJobworkId_fkey" FOREIGN KEY ("beamSendJobworkId") REFERENCES "BeamSendJobwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeamSendJobworkItem" ADD CONSTRAINT "BeamSendJobworkItem_beamId_fkey" FOREIGN KEY ("beamId") REFERENCES "Beam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
