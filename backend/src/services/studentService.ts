import { prisma } from '../config/db';
import { authService } from './authService';

export const studentService = {
    async create(data: any) {
        const hashedPassword = await authService.hashPassword(data.password);
        return await prisma.student.create({
            data: {
                ...data,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                isSpoc: true,
                placeStatus: true,
                placedJobRole: true,
                departmentId: true,
                outputYear: true,
            },
        });
    },

    async findAll() {
        return await prisma.student.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                isSpoc: true,
                placeStatus: true,
                placedJobRole: true,
                departmentId: true,
                outputYear: true,
                department: {
                    select: {
                        deptName: true,
                    },
                },
            },
        });
    },

    async findById(id: number) {
        return await prisma.student.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                isSpoc: true,
                placeStatus: true,
                placedJobRole: {
                    include: {
                        company: true
                    }
                },
                departmentId: true,
                outputYear: true,
                department: true,
                profile: true,
            },
        });
    },

    async findByOutputYearAndDept(outputYear: number, departmentId?: number) {
        return await prisma.student.findMany({
            where: {
                outputYear,
                ...(departmentId && { departmentId }),
            },
            include: {
                department: true,
                profile: true,
            },
        });
    },

    async update(id: number, data: any) {
        if (data.password) {
            data.password = await authService.hashPassword(data.password);
        }
        return await prisma.student.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                isSpoc: true,
                placeStatus: true,
                departmentId: true,
                outputYear: true,
            },
        });
    },

    async delete(id: number) {
        return await prisma.student.delete({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
    },

    async upsertProfile(studentId: number, profileData: any) {
        return await prisma.studentProfile.upsert({
            where: { studentId },
            update: profileData,
            create: {
                ...profileData,
                studentId,
            },
        });
    },

    async getProfile(studentId: number) {
        return await prisma.studentProfile.findUnique({
            where: { studentId },
        });
    },
};
