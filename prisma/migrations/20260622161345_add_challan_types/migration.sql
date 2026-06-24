-- CreateEnum
CREATE TYPE "ChallanType" AS ENUM ('SALE', 'GREY', 'FINISHED_TAKA', 'DIRECT', 'SAREES', 'BEAM', 'YARN_SALE');

-- AlterTable
ALTER TABLE "Challan" ADD COLUMN     "challanType" "ChallanType" NOT NULL DEFAULT 'SALE',
ADD COLUMN     "designNo" TEXT,
ADD COLUMN     "dripNo" TEXT,
ADD COLUMN     "dubbleNo" TEXT,
ADD COLUMN     "goodsAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "goodsRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "insideNo" TEXT,
ADD COLUMN     "mobileNo" TEXT,
ADD COLUMN     "totalCartons" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPcs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalWeight" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ChallanTakaEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "challanId" TEXT NOT NULL,
    "takaId" TEXT NOT NULL,
    "takaNo" TEXT NOT NULL,
    "itemName" TEXT,
    "loomNo" TEXT,
    "meters" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "weight" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "grade" TEXT,
    "designNo" TEXT,
    "shadeName" TEXT,
    "cut" TEXT,
    "sarees" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallanTakaEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallanBeamEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "challanId" TEXT NOT NULL,
    "beamId" TEXT NOT NULL,
    "beamNo" TEXT NOT NULL,
    "beamPosNo" TEXT,
    "yarnName" TEXT,
    "lotNo" TEXT,
    "ends" INTEGER NOT NULL DEFAULT 0,
    "meters" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "grossWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tareWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "netWt" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "pootha" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallanBeamEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallanYarnEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "challanId" TEXT NOT NULL,
    "yarnPurchaseItemId" TEXT NOT NULL,
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
    "remarks" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallanYarnEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChallanTakaEntry_challanId_idx" ON "ChallanTakaEntry"("challanId");

-- CreateIndex
CREATE INDEX "ChallanTakaEntry_takaId_idx" ON "ChallanTakaEntry"("takaId");

-- CreateIndex
CREATE INDEX "ChallanTakaEntry_tenantId_idx" ON "ChallanTakaEntry"("tenantId");

-- CreateIndex
CREATE INDEX "ChallanBeamEntry_challanId_idx" ON "ChallanBeamEntry"("challanId");

-- CreateIndex
CREATE INDEX "ChallanBeamEntry_beamId_idx" ON "ChallanBeamEntry"("beamId");

-- CreateIndex
CREATE INDEX "ChallanBeamEntry_tenantId_idx" ON "ChallanBeamEntry"("tenantId");

-- CreateIndex
CREATE INDEX "ChallanYarnEntry_challanId_idx" ON "ChallanYarnEntry"("challanId");

-- CreateIndex
CREATE INDEX "ChallanYarnEntry_yarnPurchaseItemId_idx" ON "ChallanYarnEntry"("yarnPurchaseItemId");

-- CreateIndex
CREATE INDEX "ChallanYarnEntry_tenantId_idx" ON "ChallanYarnEntry"("tenantId");

-- AddForeignKey
ALTER TABLE "ChallanTakaEntry" ADD CONSTRAINT "ChallanTakaEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanTakaEntry" ADD CONSTRAINT "ChallanTakaEntry_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "Challan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanTakaEntry" ADD CONSTRAINT "ChallanTakaEntry_takaId_fkey" FOREIGN KEY ("takaId") REFERENCES "Taka"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanBeamEntry" ADD CONSTRAINT "ChallanBeamEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanBeamEntry" ADD CONSTRAINT "ChallanBeamEntry_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "Challan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanBeamEntry" ADD CONSTRAINT "ChallanBeamEntry_beamId_fkey" FOREIGN KEY ("beamId") REFERENCES "Beam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanYarnEntry" ADD CONSTRAINT "ChallanYarnEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanYarnEntry" ADD CONSTRAINT "ChallanYarnEntry_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "Challan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanYarnEntry" ADD CONSTRAINT "ChallanYarnEntry_yarnPurchaseItemId_fkey" FOREIGN KEY ("yarnPurchaseItemId") REFERENCES "YarnPurchaseItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
