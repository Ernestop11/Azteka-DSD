-- AlterTable
ALTER TABLE "Brand" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

