import { prisma } from '../config/db';

export const departmentService = {
    async create(deptName: string) {
        return await prisma.department.create({
            data: {
                deptName,
            },
        });
    },

    async findAll() {
        return await prisma.department.findMany();
    },

    async findById(id: number) {
        return await prisma.department.findUnique({
            where: { id },
        });
    },

    async findStudentsByDepartmentId(departmentId: number) {
        return await prisma.student.findMany({
            where: { departmentId },
            select: {
                id: true,
                name: true,
                email: true,
                isSpoc: true,
                placeStatus: true,
                departmentId: true,
            },
        });
    },

    async getDepartmentStats(outputYear?: number) {
        const departments = await prisma.department.findMany({
            include: {
                students: {
                    where: outputYear ? { outputYear } : {},
                    select: {
                        placeStatus: true
                    }
                }
            }
        });

        return departments.map(dept => ({
            id: dept.id,
            deptName: dept.deptName,
            totalStudents: dept.students.length,
            placedStudents: dept.students.filter(s => s.placeStatus !== 'unplaced').length,
            dreamPlaced: dept.students.filter(s => s.placeStatus === 'Dream').length,
            openDreamPlaced: dept.students.filter(s => s.placeStatus === 'OpenDream').length
        }));
    }
};
