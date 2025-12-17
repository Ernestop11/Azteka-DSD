-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "backgroundRemoved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "special" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "splashImageUrl" TEXT DEFAULT '';
