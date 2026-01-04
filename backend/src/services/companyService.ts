import { prisma } from '../config/db';
import { Slab } from '@prisma/client';

export const companyService = {
    async createCompany(data: { name: string }) {
        return await prisma.company.create({
            data,
        });
    },

    async findAllCompanies() {
        return await prisma.company.findMany({
            include: {
                jobRoles: true,
                companyVisits: true,
            },
        });
    },

    async createCompanyVisit(data: {
        visitDate: string | Date;
        companyId: number;
        jobRoles: Array<{
            title: string;
            package: number;
            packageDetails: string;
            cgpaCutoff: number;
            slab: Slab;
            applicationDeadline: string | Date;
        }>;
    }) {
        const { visitDate, companyId, jobRoles } = data;

        // Get the latest academic year
        let latestYear = await prisma.academicYear.findFirst({
            orderBy: {
                year: 'desc',
            },
        });

        // If no academic year exists, create one for the current year
        if (!latestYear) {
            const currentYear = new Date().getFullYear();
            latestYear = await prisma.academicYear.create({
                data: { year: currentYear },
            });
        }

        return await prisma.companyVisit.create({
            data: {
                visitDate: new Date(visitDate),
                company: { connect: { id: companyId } },
                academicYear: { connect: { id: latestYear.id } },
                jobRoles: {
                    create: jobRoles.map((role) => ({
                        ...role,
                        applicationDeadline: new Date(role.applicationDeadline),
                        company: { connect: { id: companyId } },
                    })),
                },
            },
            include: {
                company: true,
                academicYear: true,
                jobRoles: true,
            },
        });
    },

    async findAllVisits() {
        return await prisma.companyVisit.findMany({
            include: {
                company: true,
                academicYear: true,
                jobRoles: true,
            },
        });
    },

    async findVisitById(id: number) {
        return await prisma.companyVisit.findUnique({
            where: { id },
            include: {
                company: true,
                academicYear: true,
                jobRoles: true,
            },
        });
    },

    async addJobRole(visitId: number, data: {
        title: string;
        package: number;
        packageDetails: string;
        cgpaCutoff: number;
        slab: Slab;
        applicationDeadline: string | Date;
    }) {
        const visit = await prisma.companyVisit.findUnique({
            where: { id: visitId },
            select: { companyId: true },
        });

        if (!visit) {
            throw new Error('Visit not found');
        }

        return await prisma.jobRole.create({
            data: {
                ...data,
                applicationDeadline: new Date(data.applicationDeadline),
                companyVisit: { connect: { id: visitId } },
                company: { connect: { id: visit.companyId } },
            },
        });
    },

    async updateJobRole(id: number, data: Partial<{
        title: string;
        package: number;
        packageDetails: string;
        cgpaCutoff: number;
        slab: Slab;
        applicationDeadline: string | Date;
    }>) {
        const updateData: any = { ...data };
        if (data.applicationDeadline) {
            updateData.applicationDeadline = new Date(data.applicationDeadline);
        }
        return await prisma.jobRole.update({
            where: { id },
            data: updateData,
        });
    },

    async findAllJobRoles() {
        return await prisma.jobRole.findMany({
            include: {
                company: true,
                companyVisit: true,
            },
        });
    },

    async findJobRoleById(id: number) {
        return await prisma.jobRole.findUnique({
            where: { id },
            include: {
                company: true,
                companyVisit: {
                    include: {
                        academicYear: true,
                    },
                },
            },
        });
    },

    async getCompanyStats(companyId: number) {
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: {
                companyVisits: {
                    include: {
                        academicYear: true,
                        jobRoles: {
                            include: {
                                placedStudents: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        placeStatus: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        visitDate: 'desc'
                    }
                }
            }
        });

        if (!company) throw new Error('Company not found');

        // Group visits by academic year
        const statsByYear: Record<number, any> = {};

        company.companyVisits.forEach(visit => {
            const year = visit.academicYear.year;
            if (!statsByYear[year]) {
                statsByYear[year] = {
                    year,
                    visits: []
                };
            }

            const totalHired = visit.jobRoles.reduce((acc, role) => acc + role.placedStudents.length, 0);

            statsByYear[year].visits.push({
                id: visit.id,
                date: visit.visitDate,
                totalHired,
                roles: visit.jobRoles.map(role => ({
                    id: role.id,
                    title: role.title,
                    package: role.package,
                    hiredCount: role.placedStudents.length,
                    hiredStudents: role.placedStudents
                }))
            });
        });

        return {
            id: company.id,
            name: company.name,
            statsByYear: Object.values(statsByYear).sort((a, b) => b.year - a.year)
        };
    }
};
