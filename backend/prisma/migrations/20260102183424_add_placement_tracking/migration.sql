-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "placedJobRoleId" INTEGER;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_placedJobRoleId_fkey" FOREIGN KEY ("placedJobRoleId") REFERENCES "JobRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;
