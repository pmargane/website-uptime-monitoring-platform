/*
  Warnings:

  - The `isActive` column on the `Monitor` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MonitorActiveState" AS ENUM ('PAUSED', 'ACTIVE');

-- AlterEnum
ALTER TYPE "MonitorStatus" ADD VALUE 'PAUSED';

-- AlterTable
ALTER TABLE "Monitor" DROP COLUMN "isActive",
ADD COLUMN     "isActive" "MonitorActiveState" NOT NULL DEFAULT 'ACTIVE';
