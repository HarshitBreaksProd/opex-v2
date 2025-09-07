/*
  Warnings:

  - Added the required column `type` to the `ExistingTrades` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('short', 'long');

-- AlterTable
ALTER TABLE "public"."ExistingTrades" ADD COLUMN     "type" "public"."OrderType" NOT NULL;
