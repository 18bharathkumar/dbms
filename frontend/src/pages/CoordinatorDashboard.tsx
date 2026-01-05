import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { AnimatePresence } from 'framer-motion';

// Components
import { DashboardHeader } from '../components/coordinator/DashboardHeader';
import { DashboardView } from '../components/coordinator/DashboardView';
import { DepartmentView } from '../components/coordinator/DepartmentView';
import { AllStudentsView } from '../components/coordinator/AllStudentsView';
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
import { EditVisitModal } from '../components/coordinator/EditVisitModal';
import { EditJobRoleModal } from '../components/coordinator/EditJobRoleModal';
import { EditCompanyModal } from '../components/coordinator/EditCompanyModal';

// Types
import type { DeptStats, Student, Company, CompanyStats, View, JobRole } from '../components/coordinator/types';

export const CoordinatorDashboard: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [view, setView] = useState<View>('dashboard');
    const [deptStats, setDeptStats] = useState<DeptStats[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedDept, setSelectedDept] = useState<DeptStats | null>(null);
    const [deptStudents, setDeptStudents] = useState<Student[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<CompanyStats | null>(null);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
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
        } else if (location.pathname === '/coordinator/students') {
            handleViewAllStudents();
        } else if (location.pathname === '/coordinator/add-visit') {
            setShowAddVisitModal(true);
            setView('all-companies'); // Default to companies view behind the modal
        } else if (location.pathname === '/coordinator') {
            setView('dashboard');
        }
    }, [location.pathname]);

    const toLocalISOString = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().slice(0, 16);
    };

    const getDefaultDeadline = () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        date.setHours(23, 59, 0, 0);
        return toLocalISOString(date);
    };

    // Modal States
    const [showAddDeptModal, setShowAddDeptModal] = useState(false);
    const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
    const [showAddVisitModal, setShowAddVisitModal] = useState(false);
    const [showManageRoleModal, setShowManageRoleModal] = useState(false);
    const [showAddJobRoleModal, setShowAddJobRoleModal] = useState(false);
    const [showEditVisitModal, setShowEditVisitModal] = useState(false);
    const [showEditJobRoleModal, setShowEditJobRoleModal] = useState(false);
    const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
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
        visitDate: toLocalISOString(new Date()),
        deadline: getDefaultDeadline(),
        jobRoles: [{ title: '', package: '', packageDetails: '', cgpaCutoff: 0, slab: 'Dream' }]
    });
    const [editVisit, setEditVisit] = useState({
        id: null,
        visitDate: '',
        deadline: getDefaultDeadline(),
        jobRoles: [] as any[]
    });
    const [editJobRole, setEditJobRole] = useState({
        id: null,
        title: '',
        package: '',
        packageDetails: '',
        cgpaCutoff: 0,
        slab: 'Dream',
        applicationDeadline: ''
    });
    const [editCompany, setEditCompany] = useState({ id: null, name: '' });

    // Job Role Management
    const [selectedJobRole, setSelectedJobRole] = useState<any>(null);
    const [roleApplications, setRoleApplications] = useState<any[]>([]);
    const [roleApplicationsError, setRoleApplicationsError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
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

    const handleEditCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editCompany.id) return;
        try {
            await api.patch(`/companies/${editCompany.id}`, { name: editCompany.name });
            setShowEditCompanyModal(false);
            if (selectedCompany) handleViewCompany(selectedCompany.id);
            fetchInitialData();
        } catch (err) {
            console.error('Failed to update company', err);
        }
    };

    const handleAddVisit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...newVisit,
                visitDate: newVisit.visitDate,
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
            if (location.pathname === '/coordinator/add-visit') {
                navigate('/coordinator/companies');
            }
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
        setActionError(null);
        fetchApplications(role.id, 'applied');
        setNextStageDate(getDefaultDeadline());
    };

    const fetchApplications = async (roleId: number, status: string) => {
        setLoading(true);
        setRoleApplicationsError(null);
        setActionError(null);
        try {
            let apiStatus = 'applied';
            if (status === 'oa') apiStatus = 'selected_for_oa';
            if (status === 'interview') apiStatus = 'selected_for_interview';

            const res = await api.get(`/applications/job-role/${roleId}?status=${apiStatus}`);
            console.log("res", res.data)
            setRoleApplications(res.data);
            setActiveTab(status as any);
            setSelectedApplicationIds([]);
        } catch (err: any) {
            console.error('Failed to fetch applications', err);
            const errorMsg = err.response?.data?.error || err.message || 'Failed to fetch applications';
            setRoleApplicationsError(errorMsg);
            setRoleApplications([]);
            setActiveTab(status as any);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateShortlist = async () => {
        if (!selectedJobRole) return;
        setActionError(null);
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
        } catch (err: any) {
            console.error('Failed to update shortlist', err);
            const errorMsg = err.response?.data?.error || err.message || 'Failed to update shortlist';
            setActionError(errorMsg);
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

    const handleEditVisit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editVisit.id) return;
        try {
            await api.patch(`/companies/visits/${editVisit.id}`, {
                visitDate: editVisit.visitDate,
                jobRoles: editVisit.jobRoles.map((r: any) => ({
                    ...r,
                    package: parseFloat(r.package),
                    cgpaCutoff: parseFloat(r.cgpaCutoff as any),
                    applicationDeadline: r.applicationDeadline
                }))
            });
            setShowEditVisitModal(false);
            if (selectedCompany) handleViewCompany(selectedCompany.id);
        } catch (err) {
            console.error('Failed to update visit', err);
        }
    };

    const handleEditJobRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editJobRole.id) return;
        try {
            await api.patch(`/companies/job-roles/${editJobRole.id}`, {
                ...editJobRole,
                package: parseFloat(editJobRole.package),
                cgpaCutoff: parseFloat(editJobRole.cgpaCutoff as any)
            });
            setShowEditJobRoleModal(false);
            if (selectedCompany) handleViewCompany(selectedCompany.id);
        } catch (err) {
            console.error('Failed to update job role', err);
        }
    };

    const handleDeleteVisit = async (visitId: number) => {
        if (!window.confirm('Are you sure you want to delete this visit and all its job roles?')) return;
        try {
            await api.delete(`/companies/visits/${visitId}`);
            if (selectedCompany) handleViewCompany(selectedCompany.id);
        } catch (err) {
            console.error('Failed to delete visit', err);
        }
    };

    const handleDeleteJobRole = async (roleId: number) => {
        if (!window.confirm('Are you sure you want to delete this job role?')) return;
        try {
            await api.delete(`/companies/job-roles/${roleId}`);
            if (selectedCompany) handleViewCompany(selectedCompany.id);
        } catch (err) {
            console.error('Failed to delete job role', err);
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
                setShowAddDeptModal={setShowAddDeptModal}
                onEditCompany={() => {
                    if (selectedCompany) {
                        setEditCompany({ id: selectedCompany.id as any, name: selectedCompany.name });
                        setShowEditCompanyModal(true);
                    }
                }}
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
                        onEditVisit={(visit) => {
                            setEditVisit({
                                id: visit.id,
                                visitDate: toLocalISOString(new Date(visit.date)),
                                deadline: visit.roles[0]?.applicationDeadline ? toLocalISOString(new Date(visit.roles[0].applicationDeadline)) : getDefaultDeadline(),
                                jobRoles: visit.roles.map((r: any) => ({
                                    ...r,
                                    package: r.package.toString(),
                                    applicationDeadline: r.applicationDeadline ? toLocalISOString(new Date(r.applicationDeadline)) : getDefaultDeadline()
                                }))
                            });
                            setShowEditVisitModal(true);
                        }}
                        onEditJobRole={(role) => {
                            setEditJobRole({
                                ...role,
                                package: role.package.toString(),
                                applicationDeadline: toLocalISOString(new Date(role.applicationDeadline))
                            });
                            setShowEditJobRoleModal(true);
                        }}
                        onDeleteVisit={handleDeleteVisit}
                        onDeleteJobRole={handleDeleteJobRole}
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
                onClose={() => {
                    setShowAddVisitModal(false);
                    if (location.pathname === '/coordinator/add-visit') {
                        navigate('/coordinator/companies');
                    }
                }}
                onSubmit={handleAddVisit}
                companies={companies}
                newVisit={newVisit}
                setNewVisit={setNewVisit}
                handleAddRoleField={handleAddRoleField}
                handleRemoveRoleField={handleRemoveRoleField}
            />

            <ManageRoleModal
                isOpen={showManageRoleModal}
                onClose={() => {
                    setShowManageRoleModal(false);
                    setActionError(null);
                }}
                selectedJobRole={selectedJobRole}
                roleApplications={roleApplications}
                roleApplicationsError={roleApplicationsError}
                actionError={actionError}
                activeTab={activeTab}
                fetchApplications={fetchApplications}
                selectedApplicationIds={selectedApplicationIds}
                setSelectedApplicationIds={setSelectedApplicationIds}
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

            <EditVisitModal
                isOpen={showEditVisitModal}
                onClose={() => setShowEditVisitModal(false)}
                onSubmit={handleEditVisit}
                editVisit={editVisit}
                setEditVisit={setEditVisit}
            />

            <EditJobRoleModal
                isOpen={showEditJobRoleModal}
                onClose={() => setShowEditJobRoleModal(false)}
                onSubmit={handleEditJobRole}
                editJobRole={editJobRole}
                setEditJobRole={setEditJobRole}
            />

            <EditCompanyModal
                isOpen={showEditCompanyModal}
                onClose={() => setShowEditCompanyModal(false)}
                onSubmit={handleEditCompany}
                editCompany={editCompany}
                setEditCompany={setEditCompany}
            />
        </div>
    );
};
