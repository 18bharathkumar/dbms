-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "isOffered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "selectedForInterview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "selectedForOA" BOOLEAN NOT NULL DEFAULT false;
