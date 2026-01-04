/*
  Warnings:

  - The `placeStatus` column on the `Student` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `slab` on the `AutoApplyRule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `slab` on the `JobRole` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Slab" AS ENUM ('Dream', 'OpenDream');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('unplaced', 'Dream', 'OpenDream');

-- AlterTable
ALTER TABLE "AutoApplyRule" DROP COLUMN "slab",
ADD COLUMN     "slab" "Slab" NOT NULL;

-- AlterTable
ALTER TABLE "JobRole" DROP COLUMN "slab",
ADD COLUMN     "slab" "Slab" NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "placeStatus",
ADD COLUMN     "placeStatus" "PlacementStatus" NOT NULL DEFAULT 'unplaced';
