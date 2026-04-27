-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NOUVEAU', 'CONFIRME', 'EN_LIVRAISON', 'LIVRE', 'ANNULE');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerAddress" TEXT,
    "customerNote" TEXT,
    "totalFcfa" INTEGER NOT NULL,
    "itemsCount" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'NOUVEAU',
    "rawMessage" TEXT NOT NULL,
    "notifSentAt" TIMESTAMP(3),
    "notifError" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "unite" TEXT NOT NULL,
    "quantite" DOUBLE PRECISION NOT NULL,
    "prixFcfa" INTEGER NOT NULL,
    "totalLine" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_ref_key" ON "Order"("ref");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
