/*
  Warnings:

  - The `status` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'SELECTED_FOR_OA', 'SELECTED_FOR_INTERVIEW', 'OFFERED', 'REJECTED');

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "status",
ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED';

-- AlterTable
ALTER TABLE "JobRole" ADD COLUMN     "interviewDate" TIMESTAMP(3),
ADD COLUMN     "oaDate" TIMESTAMP(3);
