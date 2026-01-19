/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[polarCustomerId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[polarSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `polarPriceId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `polarSubscriptionId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Organization_stripeCustomerId_key";

-- DropIndex
DROP INDEX "Subscription_stripeSubscriptionId_idx";

-- DropIndex
DROP INDEX "Subscription_stripeSubscriptionId_key";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "stripeCustomerId",
ADD COLUMN     "polarCustomerId" TEXT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "stripePriceId",
DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "polarPriceId" TEXT NOT NULL,
ADD COLUMN     "polarSubscriptionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_polarCustomerId_key" ON "Organization"("polarCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_polarSubscriptionId_key" ON "Subscription"("polarSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_polarSubscriptionId_idx" ON "Subscription"("polarSubscriptionId");
