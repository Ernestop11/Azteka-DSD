-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "cost" DECIMAL(10,2),
ADD COLUMN     "imageUrl" TEXT DEFAULT '',
ADD COLUMN     "margin" DECIMAL(5,2);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3),
    "fileUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processed',
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);
