/*
  Warnings:

  - You are about to drop the column `Asset` on the `ExistingTrades` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ExistingTrades" DROP COLUMN "Asset";
