/*
  Warnings:

  - Made the column `applicationDeadline` on table `JobRole` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "JobRole" ALTER COLUMN "applicationDeadline" SET NOT NULL,
ALTER COLUMN "applicationDeadline" SET DEFAULT CURRENT_TIMESTAMP;
