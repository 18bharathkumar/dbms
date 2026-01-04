/*
  Warnings:

  - Changed the type of `year` on the `AcademicYear` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `outputYear` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AcademicYear" DROP COLUMN "year",
ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "outputYear" INTEGER NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "placeStatus" SET DEFAULT 'unplaced';

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_year_key" ON "AcademicYear"("year");
