-- CreateTable
CREATE TABLE "YarnSendJobwork" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "challanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "challanNo" TEXT,
    "firmId" TEXT,
    "partyId" TEXT,
    "totalCartons" INTEGER NOT NULL DEFAULT 0,
    "totalCheese" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalGrossWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalTareWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalNetWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "goodsRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "goodsAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "YarnSendJobwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnSendJobworkItem" (
    "id" TEXT NOT NULL,
    "yarnSendJobworkId" TEXT NOT NULL,
    "cartonNo" TEXT NOT NULL,
    "itemName" TEXT,
    "shadeName" TEXT,
    "lotNo" TEXT,
    "denier" TEXT,
    "twist" TEXT,
    "twistDirection" TEXT,
    "cheese" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "grossWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tareWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "netWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YarnSendJobworkItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnReceiveJobwork" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "challanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "challanNo" TEXT,
    "partyId" TEXT,
    "yarnName" TEXT,
    "shadeName" TEXT,
    "emptyRollWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lotNo" TEXT,
    "denier" TEXT,
    "twist" TEXT,
    "cages" INTEGER NOT NULL DEFAULT 0,
    "rolls" INTEGER NOT NULL DEFAULT 0,
    "grossWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tareWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "netWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "goodsRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "goodsAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "deptName" TEXT,
    "originalChallanNo" TEXT,
    "originalChallanDate" TIMESTAMP(3),
    "remarks" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "YarnReceiveJobwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaletteSendJobwork" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "challanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "challanNo" TEXT,
    "partyId" TEXT,
    "paletteNo" TEXT,
    "denier" TEXT,
    "yarnName" TEXT,
    "cheese" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lotNo" TEXT,
    "netWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "pendingCheese" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "issueCheese" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "pendingNetWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "issueNetWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "PaletteSendJobwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RollsSendJobwork" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "challanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "challanNo" TEXT,
    "partyId" TEXT,
    "yarnName" TEXT,
    "lotNo" TEXT,
    "cages" INTEGER NOT NULL DEFAULT 0,
    "rolls" INTEGER NOT NULL DEFAULT 0,
    "grossWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tareWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "netWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "emptyRollWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "RollsSendJobwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TakaReceiveJobwork" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "challanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "challanNo" TEXT,
    "partyId" TEXT,
    "firmId" TEXT,
    "qualityName" TEXT,
    "takaPrefix" TEXT,
    "lotNo" TEXT,
    "withBeam" BOOLEAN NOT NULL DEFAULT false,
    "totalTakas" INTEGER NOT NULL DEFAULT 0,
    "totalMeters" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalWeight" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalSarees" INTEGER NOT NULL DEFAULT 0,
    "originalChallanNo" TEXT,
    "originalChallanDate" TIMESTAMP(3),
    "goodsRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "goodsAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "TakaReceiveJobwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TakaReceiveJobworkItem" (
    "id" TEXT NOT NULL,
    "takaReceiveJobworkId" TEXT NOT NULL,
    "takaNo" TEXT NOT NULL,
    "loomNo" TEXT,
    "meters" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "weight" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "itemName" TEXT,
    "avgWeight" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "shouldBeWeight" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "weightDiff" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "grade" TEXT,
    "designNo" TEXT,
    "shadeName" TEXT,
    "beamTakaNo" TEXT,
    "cut" TEXT,
    "sarees" INTEGER NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TakaReceiveJobworkItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "YarnSendJobwork_tenantId_idx" ON "YarnSendJobwork"("tenantId");

-- CreateIndex
CREATE INDEX "YarnSendJobwork_tenantId_deletedAt_idx" ON "YarnSendJobwork"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "YarnSendJobwork_firmId_idx" ON "YarnSendJobwork"("firmId");

-- CreateIndex
CREATE INDEX "YarnSendJobwork_partyId_idx" ON "YarnSendJobwork"("partyId");

-- CreateIndex
CREATE INDEX "YarnSendJobwork_challanDate_idx" ON "YarnSendJobwork"("challanDate");

-- CreateIndex
CREATE UNIQUE INDEX "YarnSendJobwork_tenantId_serialNumber_key" ON "YarnSendJobwork"("tenantId", "serialNumber");

-- CreateIndex
CREATE INDEX "YarnSendJobworkItem_yarnSendJobworkId_idx" ON "YarnSendJobworkItem"("yarnSendJobworkId");

-- CreateIndex
CREATE INDEX "YarnReceiveJobwork_tenantId_idx" ON "YarnReceiveJobwork"("tenantId");

-- CreateIndex
CREATE INDEX "YarnReceiveJobwork_tenantId_deletedAt_idx" ON "YarnReceiveJobwork"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "YarnReceiveJobwork_partyId_idx" ON "YarnReceiveJobwork"("partyId");

-- CreateIndex
CREATE INDEX "YarnReceiveJobwork_challanDate_idx" ON "YarnReceiveJobwork"("challanDate");

-- CreateIndex
CREATE UNIQUE INDEX "YarnReceiveJobwork_tenantId_serialNumber_key" ON "YarnReceiveJobwork"("tenantId", "serialNumber");

-- CreateIndex
CREATE INDEX "PaletteSendJobwork_tenantId_idx" ON "PaletteSendJobwork"("tenantId");

-- CreateIndex
CREATE INDEX "PaletteSendJobwork_tenantId_deletedAt_idx" ON "PaletteSendJobwork"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "PaletteSendJobwork_partyId_idx" ON "PaletteSendJobwork"("partyId");

-- CreateIndex
CREATE INDEX "PaletteSendJobwork_challanDate_idx" ON "PaletteSendJobwork"("challanDate");

-- CreateIndex
CREATE UNIQUE INDEX "PaletteSendJobwork_tenantId_serialNumber_key" ON "PaletteSendJobwork"("tenantId", "serialNumber");

-- CreateIndex
CREATE INDEX "RollsSendJobwork_tenantId_idx" ON "RollsSendJobwork"("tenantId");

-- CreateIndex
CREATE INDEX "RollsSendJobwork_tenantId_deletedAt_idx" ON "RollsSendJobwork"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "RollsSendJobwork_partyId_idx" ON "RollsSendJobwork"("partyId");

-- CreateIndex
CREATE INDEX "RollsSendJobwork_challanDate_idx" ON "RollsSendJobwork"("challanDate");

-- CreateIndex
CREATE UNIQUE INDEX "RollsSendJobwork_tenantId_serialNumber_key" ON "RollsSendJobwork"("tenantId", "serialNumber");

-- CreateIndex
CREATE INDEX "TakaReceiveJobwork_tenantId_idx" ON "TakaReceiveJobwork"("tenantId");

-- CreateIndex
CREATE INDEX "TakaReceiveJobwork_tenantId_deletedAt_idx" ON "TakaReceiveJobwork"("tenantId", "deletedAt");

-- CreateIndex
CREATE INDEX "TakaReceiveJobwork_partyId_idx" ON "TakaReceiveJobwork"("partyId");

-- CreateIndex
CREATE INDEX "TakaReceiveJobwork_firmId_idx" ON "TakaReceiveJobwork"("firmId");

-- CreateIndex
CREATE INDEX "TakaReceiveJobwork_challanDate_idx" ON "TakaReceiveJobwork"("challanDate");

-- CreateIndex
CREATE UNIQUE INDEX "TakaReceiveJobwork_tenantId_serialNumber_key" ON "TakaReceiveJobwork"("tenantId", "serialNumber");

-- CreateIndex
CREATE INDEX "TakaReceiveJobworkItem_takaReceiveJobworkId_idx" ON "TakaReceiveJobworkItem"("takaReceiveJobworkId");

-- AddForeignKey
ALTER TABLE "YarnSendJobwork" ADD CONSTRAINT "YarnSendJobwork_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnSendJobwork" ADD CONSTRAINT "YarnSendJobwork_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnSendJobwork" ADD CONSTRAINT "YarnSendJobwork_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnSendJobwork" ADD CONSTRAINT "YarnSendJobwork_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnSendJobwork" ADD CONSTRAINT "YarnSendJobwork_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnSendJobworkItem" ADD CONSTRAINT "YarnSendJobworkItem_yarnSendJobworkId_fkey" FOREIGN KEY ("yarnSendJobworkId") REFERENCES "YarnSendJobwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnReceiveJobwork" ADD CONSTRAINT "YarnReceiveJobwork_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnReceiveJobwork" ADD CONSTRAINT "YarnReceiveJobwork_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnReceiveJobwork" ADD CONSTRAINT "YarnReceiveJobwork_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnReceiveJobwork" ADD CONSTRAINT "YarnReceiveJobwork_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaletteSendJobwork" ADD CONSTRAINT "PaletteSendJobwork_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaletteSendJobwork" ADD CONSTRAINT "PaletteSendJobwork_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaletteSendJobwork" ADD CONSTRAINT "PaletteSendJobwork_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaletteSendJobwork" ADD CONSTRAINT "PaletteSendJobwork_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RollsSendJobwork" ADD CONSTRAINT "RollsSendJobwork_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RollsSendJobwork" ADD CONSTRAINT "RollsSendJobwork_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RollsSendJobwork" ADD CONSTRAINT "RollsSendJobwork_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RollsSendJobwork" ADD CONSTRAINT "RollsSendJobwork_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TakaReceiveJobwork" ADD CONSTRAINT "TakaReceiveJobwork_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TakaReceiveJobwork" ADD CONSTRAINT "TakaReceiveJobwork_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TakaReceiveJobwork" ADD CONSTRAINT "TakaReceiveJobwork_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TakaReceiveJobwork" ADD CONSTRAINT "TakaReceiveJobwork_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TakaReceiveJobwork" ADD CONSTRAINT "TakaReceiveJobwork_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TakaReceiveJobworkItem" ADD CONSTRAINT "TakaReceiveJobworkItem_takaReceiveJobworkId_fkey" FOREIGN KEY ("takaReceiveJobworkId") REFERENCES "TakaReceiveJobwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;
