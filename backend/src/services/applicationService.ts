import { prisma } from '../config/db';
import { ApplicationStatus, RecruitmentStage } from '@prisma/client';

export const applicationService = {
    async apply(studentId: number, jobRoleId: number) {
        // 1. Get student placement status
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { placeStatus: true }
        });

        if (!student) throw new Error('Student not found');

        // 2. Get job role slab and deadline
        const jobRole = await prisma.jobRole.findUnique({
            where: { id: jobRoleId },
            select: {
                slab: true,
                applicationDeadline: true,
                currentStage: true
            }
        });

        if (!jobRole) throw new Error('Job role not found');

        // Check deadline
        if (jobRole.applicationDeadline && new Date() > new Date(jobRole.applicationDeadline)) {
            throw new Error('Application deadline has passed.');
        }

        // Check if applications are still open
        if (jobRole.currentStage !== RecruitmentStage.APPLICATION_OPEN) {
            throw new Error('Applications are no longer being accepted for this role.');
        }

        // 3. Apply placement rules
        if (student.placeStatus === 'OpenDream') {
            throw new Error('You are already placed in an OpenDream role and cannot apply for more roles.');
        }

        if (student.placeStatus === 'Dream' && jobRole.slab !== 'OpenDream') {
            throw new Error('You are already placed in a Dream role. You can only apply for OpenDream roles.');
        }

        // 4. Check if already applied
        const existingApplication = await prisma.application.findUnique({
            where: {
                studentId_jobRoleId: {
                    studentId,
                    jobRoleId
                }
            }
        });

        if (existingApplication) {
            throw new Error('You have already applied for this job role.');
        }

        // 5. Create application
        return await prisma.application.create({
            data: {
                studentId,
                jobRoleId,
                status: ApplicationStatus.APPLIED
            },
            include: {
                jobRole: {
                    include: {
                        company: true
                    }
                }
            }
        });
    },

    async releaseOAList(jobRoleId: number, studentIds: number[], oaDate: Date) {
        const jobRole = await prisma.jobRole.findUnique({
            where: { id: jobRoleId },
            select: { applicationDeadline: true, currentStage: true }
        });

        if (!jobRole) throw new Error('Job role not found');

        // Check if deadline has passed
        if (new Date() <= new Date(jobRole.applicationDeadline)) {
            throw new Error('Cannot announce OA shortlist before the application deadline has passed.');
        }

        // Check if stage is correct
        if (jobRole.currentStage !== RecruitmentStage.APPLICATION_OPEN) {
            throw new Error(`Cannot announce OA shortlist. Current stage is ${jobRole.currentStage}`);
        }

        return await prisma.$transaction(async (tx) => {
            // Update OA date and stage on JobRole
            await tx.jobRole.update({
                where: { id: jobRoleId },
                data: {
                    oaDate,
                    currentStage: RecruitmentStage.OA_SHORTLIST_DONE
                }
            });

            // Update applications to SELECTED_FOR_OA and set flag
            await tx.application.updateMany({
                where: {
                    jobRoleId,
                    studentId: { in: studentIds }
                },
                data: {
                    status: ApplicationStatus.SELECTED_FOR_OA,
                    selectedForOA: true
                }
            });

            return { message: 'OA list released and stage updated to OA_SHORTLIST_DONE' };
        });
    },

    async releaseInterviewList(jobRoleId: number, studentIds: number[], interviewDate: Date) {
        const jobRole = await prisma.jobRole.findUnique({
            where: { id: jobRoleId },
            select: { currentStage: true }
        });

        if (!jobRole) throw new Error('Job role not found');

        // Check if OA shortlist was done
        if (jobRole.currentStage !== RecruitmentStage.OA_SHORTLIST_DONE) {
            throw new Error('Cannot announce interview shortlist before OA shortlist is announced.');
        }

        return await prisma.$transaction(async (tx) => {
            // Update Interview date and stage on JobRole
            await tx.jobRole.update({
                where: { id: jobRoleId },
                data: {
                    interviewDate,
                    currentStage: RecruitmentStage.INTERVIEW_SHORTLIST_DONE
                }
            });

            // Update applications to SELECTED_FOR_INTERVIEW and set flag
            await tx.application.updateMany({
                where: {
                    jobRoleId,
                    studentId: { in: studentIds }
                },
                data: {
                    status: ApplicationStatus.SELECTED_FOR_INTERVIEW,
                    selectedForInterview: true
                }
            });

            return { message: 'Interview list released and stage updated to INTERVIEW_SHORTLIST_DONE' };
        });
    },

    async releaseFinalResults(jobRoleId: number, selectedStudentIds: number[]) {
        const jobRole = await prisma.jobRole.findUnique({
            where: { id: jobRoleId },
            select: { currentStage: true, slab: true }
        });

        if (!jobRole) throw new Error('Job role not found');

        // Check if Interview shortlist was done
        if (jobRole.currentStage !== RecruitmentStage.INTERVIEW_SHORTLIST_DONE) {
            throw new Error('Cannot announce final results before interview shortlist is announced.');
        }

        return await prisma.$transaction(async (tx) => {
            // 1. Update stage on JobRole
            await tx.jobRole.update({
                where: { id: jobRoleId },
                data: { currentStage: RecruitmentStage.FINAL_RESULT_ANNOUNCED }
            });

            // 2. Update selected students to OFFERED and set flag
            await tx.application.updateMany({
                where: {
                    jobRoleId,
                    studentId: { in: selectedStudentIds }
                },
                data: {
                    status: ApplicationStatus.OFFERED,
                    isOffered: true
                }
            });

            for (const studentId of selectedStudentIds) {
                await tx.student.update({
                    where: { id: studentId },
                    data: {
                        placeStatus: jobRole.slab,
                        placedJobRoleId: jobRoleId
                    }
                });
            }

            // 4. Mark others who were in interview but not selected as REJECTED
            await tx.application.updateMany({
                where: {
                    jobRoleId,
                    studentId: { notIn: selectedStudentIds },
                    status: ApplicationStatus.SELECTED_FOR_INTERVIEW
                },
                data: { status: ApplicationStatus.REJECTED }
            });

            return { message: 'Final results released and stage updated to FINAL_RESULT_ANNOUNCED' };
        });
    },

    async updateStatus(applicationId: number, status: ApplicationStatus) {
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                jobRole: true,
                student: true
            }
        });

        if (!application) throw new Error('Application not found');

        // Update flags based on status
        const updateData: any = { status };
        if (status === ApplicationStatus.SELECTED_FOR_OA) updateData.selectedForOA = true;
        if (status === ApplicationStatus.SELECTED_FOR_INTERVIEW) updateData.selectedForInterview = true;
        if (status === ApplicationStatus.OFFERED) updateData.isOffered = true;

        // If status is being updated to 'OFFERED', update student's placement status
        if (status === ApplicationStatus.OFFERED) {
            await prisma.student.update({
                where: { id: application.studentId },
                data: {
                    placeStatus: application.jobRole.slab,
                    placedJobRoleId: application.jobRoleId
                }
            });
        }

        return await prisma.application.update({
            where: { id: applicationId },
            data: updateData,
            include: {
                student: true,
                jobRole: true
            }
        });
    },

    async getApplicationsByJobRole(jobRoleId: number, requestedStatus: string) {
        const jobRole = await prisma.jobRole.findUnique({
            where: { id: jobRoleId },
            select: { currentStage: true }
        });

        if (!jobRole) throw new Error('Job role not found');

        const filters: any = { jobRoleId };

        // Logic based on requested status and current stage
        switch (requestedStatus) {
            case 'applied':
                // Always accessible, returns all applications for this role
                break;
            case 'selected_for_oa':
                if (jobRole.currentStage === RecruitmentStage.APPLICATION_OPEN) {
                    throw new Error('OA shortlist has not been announced yet. The process is still in the Application stage.');
                }
                filters.selectedForOA = true;
                break;
            case 'selected_for_interview':
                if (jobRole.currentStage === RecruitmentStage.APPLICATION_OPEN ||
                    jobRole.currentStage === RecruitmentStage.OA_SHORTLIST_DONE) {
                    throw new Error(`Interview shortlist has not been announced yet. The process is currently in the ${jobRole.currentStage} stage.`);
                }
                filters.selectedForInterview = true;
                break;
            case 'offered':
                if (jobRole.currentStage !== RecruitmentStage.FINAL_RESULT_ANNOUNCED) {
                    throw new Error(`Final results have not been announced yet. The process is currently in the ${jobRole.currentStage} stage.`);
                }
                filters.isOffered = true;
                break;
            default:
                throw new Error('Invalid status requested. Use: applied, selected_for_oa, selected_for_interview, offered');
        }

        return await prisma.application.findMany({
            where: filters,
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        placeStatus: true,
                        department: true,
                        profile: {
                            select: {
                                cgpa: true,
                                marks10: true,
                                marks12: true,
                                phoneNo: true,
                                address: true,
                                resume: true
                            }
                        }
                    }
                }
            }
        });
    },

    async getStudentApplications(studentId: number) {
        return await prisma.application.findMany({
            where: { studentId },
            include: {
                jobRole: {
                    include: {
                        company: true
                    }
                }
            }
        });
    },

    async getAllApplications() {
        return await prisma.application.findMany({
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: true,
                        placeStatus: true,
                        profile: {
                            select: { cgpa: true }
                        }
                    }
                },
                jobRole: {
                    include: {
                        company: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
};
