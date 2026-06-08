-- AlterTable
ALTER TABLE "Party" ADD COLUMN     "dueDays" INTEGER;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "sku" DROP NOT NULL;
