/*
  Warnings:

  - Added the required column `quantity` to the `ExistingTrades` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ExistingTrades" ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL;
