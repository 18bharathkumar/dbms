export interface DeptStats {
    id: number;
    deptName: string;
    totalStudents: number;
    placedStudents: number;
    dreamPlaced: number;
    openDreamPlaced: number;
}

export interface Student {
    id: number;
    name: string;
    email: string;
    placeStatus: string;
    department?: { deptName: string };
    outputYear?: number;
    profile?: {
        cgpa?: number;
        phoneNo?: string;
        address?: string;
        resume?: string;
        marks10?: number;
        marks12?: number;
    };
    placedJobRole?: {
        title: string;
        package: number;
        company?: { name: string };
    };
}

export interface Company {
    id: number;
    name: string;
}

export interface CompanyStats {
    id: number;
    name: string;
    statsByYear: {
        year: number;
        visits: {
            id: number;
            date: string;
            totalHired: number;
            roles: {
                id: number;
                title: string;
                package: number;
                hiredCount: number;
                hiredStudents: any[];
            }[];
        }[];
    }[];
}

export interface JobRole {
    id: number;
    title: string;
    company?: { name: string };
    slab: string;
    package: number;
    cgpaCutoff: number;
    applicationDeadline: string;
    currentStage?: string;
}

export interface Application {
    id: number;
    status: string;
    createdAt: string;
    student: {
        name: string;
        email: string;
    };
    jobRole: {
        title: string;
        company: {
            name: string;
        };
    };
}

export type View = 'dashboard' | 'department' | 'company' | 'all-students' | 'all-applications' | 'all-companies' | 'all-jobs';
