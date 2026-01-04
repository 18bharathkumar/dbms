import { prisma } from '../config/db';

export const academicYearService = {
    async create(year: number) {
        return await prisma.academicYear.create({
            data: { year },
        });
    },

    async findAll() {
        return await prisma.academicYear.findMany();
    },

    async findById(id: number) {
        return await prisma.academicYear.findUnique({
            where: { id },
        });
    },

    async update(id: number, year: number) {
        return await prisma.academicYear.update({
            where: { id },
            data: { year },
        });
    },
};
