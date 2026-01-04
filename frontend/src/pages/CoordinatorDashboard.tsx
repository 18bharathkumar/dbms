import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { AnimatePresence } from 'framer-motion';

// Components
import { DashboardHeader } from '../components/coordinator/DashboardHeader';
import { DashboardView } from '../components/coordinator/DashboardView';
import { DepartmentView } from '../components/coordinator/DepartmentView';
import { AllStudentsView } from '../components/coordinator/AllStudentsView';
import { AllApplicationsView } from '../components/coordinator/AllApplicationsView';
import { AllCompaniesView } from '../components/coordinator/AllCompaniesView';
import { AllJobsView } from '../components/coordinator/AllJobsView';
import { CompanyView } from '../components/coordinator/CompanyView';

// Modals
import { AddDepartmentModal } from '../components/coordinator/AddDepartmentModal';
import { AddCompanyModal } from '../components/coordinator/AddCompanyModal';
import { AddVisitModal } from '../components/coordinator/AddVisitModal';
import { AddJobRoleModal } from '../components/coordinator/AddJobRoleModal';
import { ManageRoleModal } from '../components/coordinator/ManageRoleModal';
import { StudentProfileModal } from '../components/coordinator/StudentProfileModal';

// Types
import type { DeptStats, Student, Company, CompanyStats, View, JobRole, Application } from '../components/coordinator/types';

export const CoordinatorDashboard: React.FC = () => {
    const location = useLocation();
    const [view, setView] = useState<View>('dashboard');
    const [deptStats, setDeptStats] = useState<DeptStats[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedDept, setSelectedDept] = useState<DeptStats | null>(null);
    const [deptStudents, setDeptStudents] = useState<Student[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<CompanyStats | null>(null);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [allApplications, setAllApplications] = useState<Application[]>([]);
    const [allJobs, setAllJobs] = useState<JobRole[]>([]);
    const [jobSearchTerm, setJobSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [companySearchTerm, setCompanySearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() + 1);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    useEffect(() => {
        if (location.pathname === '/coordinator/companies') {
            setView('all-companies');
        } else if (location.pathname === '/coordinator/jobs') {
            handleViewAllJobs();
        } else if (location.pathname === '/coordinator') {
            setView('dashboard');
        }
    }, [location.pathname]);

    const getDefaultDeadline = () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        date.setHours(23, 59, 0, 0);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().slice(0, 16);
    };

    // Modal States
    const [showAddDeptModal, setShowAddDeptModal] = useState(false);
    const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
    const [showAddVisitModal, setShowAddVisitModal] = useState(false);
    const [showManageRoleModal, setShowManageRoleModal] = useState(false);
    const [showAddJobRoleModal, setShowAddJobRoleModal] = useState(false);
    const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);

    // Form Data
    const [newDeptName, setNewDeptName] = useState('');
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newJobRole, setNewJobRole] = useState({
        title: '',
        package: '',
        packageDetails: '',
        cgpaCutoff: 0,
        slab: 'Dream',
        applicationDeadline: getDefaultDeadline()
    });
    const [newVisit, setNewVisit] = useState({
        companyId: '',
        visitDate: '',
        deadline: getDefaultDeadline(),
        jobRoles: [{ title: '', package: '', packageDetails: '', cgpaCutoff: 0, slab: 'Dream' }]
    });

    // Job Role Management
    const [selectedJobRole, setSelectedJobRole] = useState<any>(null);
    const [roleApplications, setRoleApplications] = useState<any[]>([]);
    const [selectedApplicationIds, setSelectedApplicationIds] = useState<number[]>([]);
    const [nextStageDate, setNextStageDate] = useState(getDefaultDeadline());
    const [activeTab, setActiveTab] = useState<'applied' | 'oa' | 'interview'>('applied');

    useEffect(() => {
        fetchInitialData();
    }, [selectedYear]);

    const handleViewProfile = async (studentId: number) => {
        setLoading(true);
        try {
            const res = await api.get(`/students/${studentId}`);
            setSelectedStudent(res.data);
        } catch (err) {
            console.error('Failed to fetch student profile', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [deptsRes, companiesRes] = await Promise.all([
                api.get('/departments/stats', { params: { outputYear: selectedYear } }),
                api.get('/companies')
            ]);
            setDeptStats(deptsRes.data);
            setCompanies(companiesRes.data);
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDept = async (dept: DeptStats) => {
        setLoading(true);
        try {
            const res = await api.get(`/departments/${dept.id}/students`);
            setDeptStudents(res.data);
            setSelectedDept(dept);
            setView('department');
        } catch (err) {
            console.error('Failed to fetch dept students', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewCompany = async (companyId: number) => {
        setLoading(true);
        try {
            const res = await api.get(`/companies/${companyId}/stats`);
            setSelectedCompany(res.data);
            setView('company');
        } catch (err) {
            console.error('Failed to fetch company stats', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewAllStudents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/students');
            setAllStudents(res.data);
            setView('all-students');
        } catch (err) {
            console.error('Failed to fetch all students', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewAllApplications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/applications');
            setAllApplications(res.data);
            setView('all-applications');
        } catch (err) {
            console.error('Failed to fetch all applications', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewAllJobs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/companies/job-roles');
            setAllJobs(res.data);
            setView('all-jobs');
        } catch (err) {
            console.error('Failed to fetch all jobs', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDepartment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/departments', { deptName: newDeptName });
            setShowAddDeptModal(false);
            setNewDeptName('');
            fetchInitialData();
        } catch (err) {
            console.error('Failed to create department', err);
        }
    };

    const handleAddCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/companies', { name: newCompanyName });
            setShowAddCompanyModal(false);
            setNewCompanyName('');
            fetchInitialData();
        } catch (err) {
            console.error('Failed to create company', err);
        }
    };

    const handleAddVisit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...newVisit,
                visitDate: new Date().toISOString(),
                companyId: parseInt(newVisit.companyId),
                jobRoles: newVisit.jobRoles.map(r => ({
                    ...r,
                    package: parseFloat(r.package),
                    cgpaCutoff: parseFloat(r.cgpaCutoff as any),
                    applicationDeadline: newVisit.deadline
                }))
            };
            await api.post('/companies/visits', payload);
            setShowAddVisitModal(false);
            setNewVisit({
                companyId: '',
                visitDate: '',
                deadline: getDefaultDeadline(),
                jobRoles: [{ title: '', package: '', packageDetails: '', cgpaCutoff: 0, slab: 'Dream' }]
            });
            fetchInitialData();
        } catch (err) {
            console.error('Failed to schedule visit', err);
        }
    };

    const handleManageRole = async (role: any) => {
        setSelectedJobRole(role);
        setShowManageRoleModal(true);
        fetchApplications(role.id, 'applied');
        setNextStageDate(getDefaultDeadline());
    };

    const fetchApplications = async (roleId: number, status: string) => {
        setLoading(true);
        try {
            let apiStatus = 'applied';
            if (status === 'oa') apiStatus = 'selected_for_oa';
            if (status === 'interview') apiStatus = 'selected_for_interview';

            const res = await api.get(`/applications/job-role/${roleId}?status=${apiStatus}`);
            setRoleApplications(res.data);
            setActiveTab(status as any);
            setSelectedApplicationIds([]);
        } catch (err) {
            console.error('Failed to fetch applications', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateShortlist = async () => {
        if (!selectedJobRole) return;
        try {
            if (activeTab === 'applied') {
                await api.post(`/applications/job-role/${selectedJobRole.id}/oa-list`, {
                    studentIds: selectedApplicationIds,
                    oaDate: nextStageDate
                });
                fetchApplications(selectedJobRole.id, 'oa');
            } else if (activeTab === 'oa') {
                await api.post(`/applications/job-role/${selectedJobRole.id}/interview-list`, {
                    studentIds: selectedApplicationIds,
                    interviewDate: nextStageDate
                });
                fetchApplications(selectedJobRole.id, 'interview');
            } else if (activeTab === 'interview') {
                await api.post(`/applications/job-role/${selectedJobRole.id}/final-results`, {
                    selectedStudentIds: selectedApplicationIds
                });
                setShowManageRoleModal(false);
                if (selectedCompany) handleViewCompany(selectedCompany.id);
            }
        } catch (err) {
            console.error('Failed to update shortlist', err);
        }
    };

    const handleAddJobRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVisitId) return;
        try {
            await api.post(`/companies/visits/${selectedVisitId}/job-roles`, {
                ...newJobRole,
                package: parseFloat(newJobRole.package),
                cgpaCutoff: parseFloat(newJobRole.cgpaCutoff as any)
            });
            setShowAddJobRoleModal(false);
            setNewJobRole({ title: '', package: '', packageDetails: '', cgpaCutoff: 0, slab: 'Dream', applicationDeadline: getDefaultDeadline() });
            if (selectedCompany) handleViewCompany(selectedCompany.id);
        } catch (err) {
            console.error('Failed to add job role', err);
        }
    };

    const handleAddRoleField = () => {
        setNewVisit({
            ...newVisit,
            jobRoles: [...newVisit.jobRoles, { title: '', package: '', packageDetails: '', cgpaCutoff: 0, slab: 'Dream' }]
        });
    };

    const handleRemoveRoleField = (index: number) => {
        const roles = [...newVisit.jobRoles];
        roles.splice(index, 1);
        setNewVisit({ ...newVisit, jobRoles: roles });
    };

    const totalStudents = deptStats.reduce((acc, d) => acc + d.totalStudents, 0);
    const totalPlaced = deptStats.reduce((acc, d) => acc + d.placedStudents, 0);

    if (loading && view === 'dashboard') return <div className="flex items-center justify-center h-64">Loading...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <DashboardHeader
                view={view}
                setView={setView}
                selectedDeptName={selectedDept?.deptName}
                selectedCompanyName={selectedCompany?.name}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                handleViewAllStudents={handleViewAllStudents}
                handleViewAllApplications={handleViewAllApplications}
                setShowAddDeptModal={setShowAddDeptModal}
            />

            <AnimatePresence mode="wait">
                {view === 'dashboard' && (
                    <DashboardView
                        totalStudents={totalStudents}
                        totalPlaced={totalPlaced}
                        companies={companies}
                        deptStats={deptStats}
                        handleViewDept={handleViewDept}
                        handleViewCompany={handleViewCompany}
                    />
                )}

                {view === 'department' && (
                    <DepartmentView
                        deptStudents={deptStudents}
                        handleViewProfile={handleViewProfile}
                    />
                )}

                {view === 'all-students' && (
                    <AllStudentsView
                        allStudents={allStudents}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        handleViewProfile={handleViewProfile}
                    />
                )}

                {view === 'all-applications' && (
                    <AllApplicationsView allApplications={allApplications} />
                )}

                {view === 'all-companies' && (
                    <AllCompaniesView
                        companies={companies}
                        companySearchTerm={companySearchTerm}
                        setCompanySearchTerm={setCompanySearchTerm}
                        setShowAddCompanyModal={setShowAddCompanyModal}
                        setShowAddVisitModal={setShowAddVisitModal}
                        handleViewCompany={handleViewCompany}
                    />
                )}

                {view === 'all-jobs' && (
                    <AllJobsView
                        allJobs={allJobs}
                        jobSearchTerm={jobSearchTerm}
                        setJobSearchTerm={setJobSearchTerm}
                        handleManageRole={handleManageRole}
                    />
                )}

                {view === 'company' && selectedCompany && (
                    <CompanyView
                        selectedCompany={selectedCompany}
                        setSelectedVisitId={setSelectedVisitId}
                        setShowAddJobRoleModal={setShowAddJobRoleModal}
                        handleManageRole={handleManageRole}
                        handleViewProfile={handleViewProfile}
                    />
                )}
            </AnimatePresence>

            {/* Modals */}
            <AddDepartmentModal
                isOpen={showAddDeptModal}
                onClose={() => setShowAddDeptModal(false)}
                onSubmit={handleAddDepartment}
                newDeptName={newDeptName}
                setNewDeptName={setNewDeptName}
            />

            <AddCompanyModal
                isOpen={showAddCompanyModal}
                onClose={() => setShowAddCompanyModal(false)}
                onSubmit={handleAddCompany}
                newCompanyName={newCompanyName}
                setNewCompanyName={setNewCompanyName}
            />

            <AddVisitModal
                isOpen={showAddVisitModal}
                onClose={() => setShowAddVisitModal(false)}
                onSubmit={handleAddVisit}
                companies={companies}
                newVisit={newVisit}
                setNewVisit={setNewVisit}
                handleAddRoleField={handleAddRoleField}
                handleRemoveRoleField={handleRemoveRoleField}
            />

            <ManageRoleModal
                isOpen={showManageRoleModal}
                onClose={() => setShowManageRoleModal(false)}
                selectedJobRole={selectedJobRole}
                roleApplications={roleApplications}
                activeTab={activeTab}
                fetchApplications={fetchApplications}
                selectedApplicationIds={selectedApplicationIds}
                setSelectedApplicationIds={setSelectedApplicationIds}
                nextStageDate={nextStageDate}
                setNextStageDate={setNextStageDate}
                handleUpdateShortlist={handleUpdateShortlist}
            />

            <AddJobRoleModal
                isOpen={showAddJobRoleModal}
                onClose={() => setShowAddJobRoleModal(false)}
                onSubmit={handleAddJobRole}
                newJobRole={newJobRole}
                setNewJobRole={setNewJobRole}
            />

            <StudentProfileModal
                selectedStudent={selectedStudent}
                onClose={() => setSelectedStudent(null)}
            />
        </div>
    );
};
