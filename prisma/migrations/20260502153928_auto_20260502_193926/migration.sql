-- CreateTable
CREATE TABLE "ip_whitelist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "address" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ip_whitelist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ip_whitelist_address_key" ON "ip_whitelist"("address");

-- CreateIndex
CREATE INDEX "ip_whitelist_address_isActive_idx" ON "ip_whitelist"("address", "isActive");
