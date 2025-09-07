-- CreateTable
CREATE TABLE "public"."Users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,
    "decimal" INTEGER NOT NULL DEFAULT 4,
    "lastLoggedInt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Asset" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "decimal" TEXT NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExistingTrades" (
    "id" TEXT NOT NULL,
    "openPrice" INTEGER NOT NULL,
    "closePrice" INTEGER NOT NULL,
    "leverage" INTEGER NOT NULL,
    "pnl" INTEGER NOT NULL,
    "decimal" INTEGER NOT NULL,
    "assetId" TEXT NOT NULL,
    "liquidated" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExistingTrades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_symbol_key" ON "public"."Asset"("symbol");

-- AddForeignKey
ALTER TABLE "public"."ExistingTrades" ADD CONSTRAINT "ExistingTrades_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExistingTrades" ADD CONSTRAINT "ExistingTrades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
