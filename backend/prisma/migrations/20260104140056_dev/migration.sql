/*
  Warnings:

  - You are about to drop the column `eligibleOutputYears` on the `JobRole` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CompanyVisit" ALTER COLUMN "visitDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "JobRole" DROP COLUMN "eligibleOutputYears",
ALTER COLUMN "applicationDeadline" DROP DEFAULT;

-- AlterTable
ALTER TABLE "StudentProfile" ALTER COLUMN "marks10" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "marks12" SET DATA TYPE DOUBLE PRECISION;
