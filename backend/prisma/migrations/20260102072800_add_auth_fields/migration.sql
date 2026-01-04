-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" SERIAL NOT NULL,
    "year" TEXT NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyVisit" (
    "id" SERIAL NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "companyId" INTEGER NOT NULL,
    "academicYearId" INTEGER NOT NULL,

    CONSTRAINT "CompanyVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRole" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "package" DOUBLE PRECISION NOT NULL,
    "packageDetails" TEXT NOT NULL,
    "cgpaCutoff" DOUBLE PRECISION NOT NULL,
    "slab" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "companyVisitId" INTEGER NOT NULL,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "deptName" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementCell" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "PlacementCell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coordinator" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "placementCellId" INTEGER NOT NULL,

    CONSTRAINT "Coordinator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isSpoc" BOOLEAN NOT NULL DEFAULT false,
    "placeStatus" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" SERIAL NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "cgpa" DOUBLE PRECISION NOT NULL,
    "marks10" INTEGER NOT NULL,
    "marks12" INTEGER NOT NULL,
    "resume" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "jobRoleId" INTEGER NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutoApplyPreferredCompany" (
    "autoApplyRuleId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "AutoApplyPreferredCompany_pkey" PRIMARY KEY ("autoApplyRuleId","companyId")
);

-- CreateTable
CREATE TABLE "AutoApplyRule" (
    "id" SERIAL NOT NULL,
    "minCgpa" DOUBLE PRECISION NOT NULL,
    "slab" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "AutoApplyRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_year_key" ON "AcademicYear"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Department_deptName_key" ON "Department"("deptName");

-- CreateIndex
CREATE UNIQUE INDEX "Coordinator_email_key" ON "Coordinator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_studentId_key" ON "StudentProfile"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_studentId_jobRoleId_key" ON "Application"("studentId", "jobRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "AutoApplyRule_studentId_key" ON "AutoApplyRule"("studentId");

-- AddForeignKey
ALTER TABLE "CompanyVisit" ADD CONSTRAINT "CompanyVisit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyVisit" ADD CONSTRAINT "CompanyVisit_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRole" ADD CONSTRAINT "JobRole_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRole" ADD CONSTRAINT "JobRole_companyVisitId_fkey" FOREIGN KEY ("companyVisitId") REFERENCES "CompanyVisit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coordinator" ADD CONSTRAINT "Coordinator_placementCellId_fkey" FOREIGN KEY ("placementCellId") REFERENCES "PlacementCell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoApplyPreferredCompany" ADD CONSTRAINT "AutoApplyPreferredCompany_autoApplyRuleId_fkey" FOREIGN KEY ("autoApplyRuleId") REFERENCES "AutoApplyRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoApplyPreferredCompany" ADD CONSTRAINT "AutoApplyPreferredCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoApplyRule" ADD CONSTRAINT "AutoApplyRule_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
