/*
  Warnings:

  - Added the required column `margin` to the `ExistingTrades` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ExistingTrades" ADD COLUMN     "margin" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Users" ALTER COLUMN "lastLoggedInt" DROP NOT NULL;
