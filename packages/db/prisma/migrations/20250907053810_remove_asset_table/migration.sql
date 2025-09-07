/*
  Warnings:

  - You are about to drop the column `assetId` on the `ExistingTrades` table. All the data in the column will be lost.
  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `Asset` to the `ExistingTrades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `asset` to the `ExistingTrades` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ExistingTrades" DROP CONSTRAINT "ExistingTrades_assetId_fkey";

-- AlterTable
ALTER TABLE "public"."ExistingTrades" DROP COLUMN "assetId",
ADD COLUMN     "Asset" TEXT NOT NULL,
ADD COLUMN     "asset" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Asset";
