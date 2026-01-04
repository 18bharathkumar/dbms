import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Badge, Button } from '../components/UI';
import {
    Users,
    Building2,
    CalendarCheck,
    Plus,
    Search,
    ChevronRight,
    ArrowLeft,
    TrendingUp,
    Award,
    Calendar,
    X,
    FileText
} from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

interface DeptStats {
    id: number;
    deptName: string;
    totalStudents: number;
    placedStudents: number;
    dreamPlaced: number;
    openDreamPlaced: number;
}

interface Student {
    id: number;
    name: string;
    email: string;
    placeStatus: string;
    department?: { deptName: string };
}

interface Company {
    id: number;
    name: string;
}

interface CompanyStats {
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

type View = 'dashboard' | 'department' | 'company' | 'all-students' | 'all-applications' | 'all-companies' | 'all-jobs';

export const CoordinatorDashboard: React.FC = () => {
    const location = useLocation();
    const [view, setView] = useState<View>('dashboard');
    const [deptStats, setDeptStats] = useState<DeptStats[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedDept, setSelectedDept] = useState<DeptStats | null>(null);
    const [deptStudents, setDeptStudents] = useState<Student[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<CompanyStats | null>(null);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [allApplications, setAllApplications] = useState<any[]>([]);
    const [allJobs, setAllJobs] = useState<any[]>([]);
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
            setView('dashboard'); // Or just keep the modal open
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
            // Map UI tabs to API status
            let apiStatus = 'applied';
            if (status === 'oa') apiStatus = 'selected_for_oa';
            if (status === 'interview') apiStatus = 'selected_for_interview';

            const res = await api.get(`/applications/job-role/${roleId}?status=${apiStatus}`);
            setRoleApplications(res.data);
            console.log(res.data);
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
                // Refresh company view
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    {view !== 'dashboard' && (
                        <button
                            onClick={() => setView('dashboard')}
                            className="flex items-center gap-2 text-indigo-600 font-medium mb-2 hover:underline"
                        >
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </button>
                    )}
                    <h1 className="text-3xl font-bold text-slate-900">
                        {view === 'dashboard' && 'Coordinator Overview'}
                        {view === 'department' && `${selectedDept?.deptName} Department`}
                        {view === 'company' && `${selectedCompany?.name} Statistics`}
                        {view === 'all-students' && 'All Registered Students'}
                        {view === 'all-companies' && 'Manage Companies'}
                        {view === 'all-jobs' && 'Manage Applications'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {view === 'dashboard' && 'Manage placements, companies, and student applications.'}
                        {view === 'department' && 'Viewing students and placement details for this department.'}
                        {view === 'company' && 'Detailed hiring history and visit statistics.'}
                        {view === 'all-students' && 'Complete list of all students across departments.'}
                        {view === 'all-companies' && 'View and manage all registered companies and visits.'}
                        {view === 'all-jobs' && 'View and manage all job applications.'}
                    </p>
                </div>
                {view === 'dashboard' && (
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                            <Calendar size={16} className="text-slate-400" />
                            <select
                                className="text-sm font-medium text-slate-700 outline-none bg-transparent"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            >
                                {[...Array(5)].map((_, i) => {
                                    const year = new Date().getFullYear() + 1 - i;
                                    return <option key={year} value={year}>{year} Batch</option>;
                                })}
                            </select>
                        </div>
                        <Button variant="outline" className="gap-2" onClick={handleViewAllStudents}>
                            <Users size={18} />
                            All Students
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={handleViewAllApplications}>
                            <FileText size={18} />
                            All Applications
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={() => setShowAddDeptModal(true)}>
                            <Users size={18} />
                            Add Dept
                        </Button>
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {view === 'dashboard' && (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-10"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Placed Students', value: totalPlaced, icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { label: 'Companies', value: companies.length, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { label: 'Placement Rate', value: `${totalStudents ? Math.round((totalPlaced / totalStudents) * 100) : 0}%`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
                            ].map((stat) => (
                                <Card key={stat.label} className="flex items-center gap-4 p-5">
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                        <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Departments Section */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Users className="text-indigo-600" size={20} />
                                Department Statistics
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {deptStats.map((dept) => (
                                    <Card key={dept.id} className="group hover:border-indigo-200 transition-all cursor-pointer" onClick={() => handleViewDept(dept)}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">{dept.deptName}</h3>
                                                <p className="text-sm text-slate-500">{dept.totalStudents} Total Students</p>
                                            </div>
                                            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                <ChevronRight size={20} />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Placed</span>
                                                <span className="font-semibold text-emerald-600">{dept.placedStudents}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-emerald-500 h-full rounded-full"
                                                    style={{ width: `${dept.totalStudents ? (dept.placedStudents / dept.totalStudents) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 pt-2">
                                                <div className="bg-blue-50 p-2 rounded-lg">
                                                    <p className="text-[10px] uppercase font-bold text-blue-600">Dream</p>
                                                    <p className="text-lg font-bold text-blue-700">{dept.dreamPlaced}</p>
                                                </div>
                                                <div className="bg-purple-50 p-2 rounded-lg">
                                                    <p className="text-[10px] uppercase font-bold text-purple-600">Open Dream</p>
                                                    <p className="text-lg font-bold text-purple-700">{dept.openDreamPlaced}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* Companies Section */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Building2 className="text-indigo-600" size={20} />
                                Registered Companies
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {companies.map((company) => (
                                    <Card
                                        key={company.id}
                                        className="flex items-center justify-between p-4 hover:border-indigo-200 transition-all cursor-pointer group"
                                        onClick={() => handleViewCompany(company.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                {company.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-slate-900">{company.name}</span>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600" />
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </motion.div>
                )}

                {view === 'department' && (
                    <motion.div
                        key="department"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <Card className="p-0 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {deptStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                        {student.name?.charAt(0) || 'S'}
                                                    </div>
                                                    <span className="font-medium text-slate-900">{student.name || 'Incomplete Profile'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{student.email}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={student.placeStatus === 'unplaced' ? 'warning' : 'success'}>
                                                    {student.placeStatus}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleViewProfile(student.id)}
                                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                                                >
                                                    View Profile
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    </motion.div>
                )}

                {view === 'all-students' && (
                    <motion.div
                        key="all-students"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex gap-4 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name, email or department..."
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <Card className="p-0 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {allStudents
                                        .filter(s =>
                                            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            s.department?.deptName.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((student) => (
                                            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                            {student.name?.charAt(0) || 'S'}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900">{student.name || 'Incomplete Profile'}</p>
                                                            <p className="text-xs text-slate-500">{student.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{student.department?.deptName}</td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={student.placeStatus === 'unplaced' ? 'warning' : 'success'}>
                                                        {student.placeStatus}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleViewProfile(student.id)}
                                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                                                    >
                                                        View Profile
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </Card>
                    </motion.div>
                )}

                {view === 'all-applications' && (
                    <motion.div
                        key="all-applications"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <Card className="p-0 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Applied Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {allApplications.map((app) => (
                                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                        {app.student.name?.charAt(0) || 'S'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{app.student.name}</p>
                                                        <p className="text-xs text-slate-500">{app.student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{app.jobRole.company.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{app.jobRole.title}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={
                                                    app.status === 'OFFERED' ? 'success' :
                                                        app.status === 'REJECTED' ? 'error' : 'info'
                                                }>
                                                    {app.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    </motion.div>
                )}

                {view === 'all-companies' && (
                    <motion.div
                        key="all-companies"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col md:flex-row gap-4 justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search companies..."
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    value={companySearchTerm}
                                    onChange={(e) => setCompanySearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="gap-2" onClick={() => setShowAddCompanyModal(true)}>
                                    <Building2 size={18} />
                                    Add Company
                                </Button>
                                <Button className="gap-2" onClick={() => setShowAddVisitModal(true)}>
                                    <Plus size={18} />
                                    New Visit
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {companies
                                .filter(c => c.name.toLowerCase().includes(companySearchTerm.toLowerCase()))
                                .map((company) => (
                                    <Card
                                        key={company.id}
                                        className="flex items-center justify-between p-4 hover:border-indigo-200 transition-all cursor-pointer group"
                                        onClick={() => handleViewCompany(company.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                {company.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-slate-900">{company.name}</span>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600" />
                                    </Card>
                                ))}
                        </div>
                    </motion.div>
                )}

                {view === 'all-jobs' && (
                    <motion.div
                        key="all-jobs"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex gap-4 mb-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search job roles..."
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    value={jobSearchTerm}
                                    onChange={(e) => setJobSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allJobs
                                .filter(job => job.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) || job.company?.name.toLowerCase().includes(jobSearchTerm.toLowerCase()))
                                .map((job) => (
                                    <Card key={job.id} className="p-6 hover:border-indigo-200 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                                                <p className="text-sm text-slate-500">{job.company?.name}</p>
                                            </div>
                                            <Badge variant={job.slab === 'Dream' ? 'warning' : 'info'}>{job.slab}</Badge>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Package</span>
                                                <span className="font-semibold text-slate-900">₹{job.package.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">CGPA Cutoff</span>
                                                <span className="font-semibold text-slate-900">{job.cgpaCutoff}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Deadline</span>
                                                <span className="font-semibold text-slate-900">{new Date(job.applicationDeadline).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm items-center pt-2 border-t border-slate-100 mt-2">
                                                <span className="text-slate-500">Status</span>
                                                <Badge variant={
                                                    job.currentStage === 'APPLICATION_OPEN' ? 'success' :
                                                        job.currentStage === 'FINAL_RESULT_ANNOUNCED' ? 'info' : 'warning'
                                                }>
                                                    {job.currentStage?.replace(/_/g, ' ') || 'OPEN'}
                                                </Badge>
                                            </div>
                                        </div>

                                        <Button className="w-full" onClick={() => handleManageRole(job)}>
                                            Manage Applications of {job.company?.name}
                                        </Button>
                                    </Card>
                                ))}
                        </div>
                    </motion.div>
                )}

                {view === 'company' && selectedCompany && (
                    <motion.div
                        key="company"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        {selectedCompany.statsByYear.map((yearStat) => (
                            <div key={yearStat.year} className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Calendar className="text-indigo-600" size={20} />
                                    Academic Year {yearStat.year}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {yearStat.visits.map((visit) => (
                                        <Card key={visit.id} className="p-6">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">Visit Date</p>
                                                    <p className="text-lg font-bold text-slate-900">{new Date(visit.date).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Button size="sm" variant="outline" onClick={() => {
                                                        setSelectedVisitId(visit.id);
                                                        setShowAddJobRoleModal(true);
                                                    }}>
                                                        <Plus size={14} className="mr-1" /> Add Role
                                                    </Button>
                                                    <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                                                        {visit.totalHired} Hired
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Roles & Hiring</p>
                                                {visit.roles.map((role) => (
                                                    <div key={role.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h4 className="font-bold text-slate-900">{role.title}</h4>
                                                            <span className="text-sm font-bold text-indigo-600">₹{role.package.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Award size={14} className="text-amber-500" />
                                                                <span className="text-sm text-slate-600">{role.hiredCount} Students Hired</span>
                                                            </div>
                                                            <Button size="sm" variant="outline" onClick={() => handleManageRole(role)}>
                                                                Manage
                                                            </Button>
                                                        </div>
                                                        {role.hiredStudents.length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-1">
                                                                {role.hiredStudents.map(s => (
                                                                    <span
                                                                        key={s.id}
                                                                        className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600 cursor-pointer hover:bg-indigo-50"
                                                                        onClick={() => handleViewProfile(s.id)}
                                                                    >
                                                                        {s.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {selectedCompany.statsByYear.length === 0 && (
                            <Card className="p-12 text-center">
                                <p className="text-slate-500">No visit history found for this company.</p>
                            </Card>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Department Modal */}
            <AnimatePresence>
                {showAddDeptModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Add Department</h2>
                                <button onClick={() => setShowAddDeptModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAddDepartment} className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700">Department Name</label>
                                    <input
                                        type="text"
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        value={newDeptName}
                                        onChange={(e) => setNewDeptName(e.target.value)}
                                        placeholder="e.g. Computer Science"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setShowAddDeptModal(false)}>Cancel</Button>
                                    <Button type="submit">Create Department</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Company Modal */}
            <AnimatePresence>
                {showAddCompanyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Add Company</h2>
                                <button onClick={() => setShowAddCompanyModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAddCompany} className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700">Company Name</label>
                                    <input
                                        type="text"
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        value={newCompanyName}
                                        onChange={(e) => setNewCompanyName(e.target.value)}
                                        placeholder="e.g. Google"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setShowAddCompanyModal(false)}>Cancel</Button>
                                    <Button type="submit">Register Company</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Visit Modal */}
            <AnimatePresence>
                {showAddVisitModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Schedule New Visit</h2>
                                <button onClick={() => setShowAddVisitModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAddVisit} className="space-y-6">
                                <div>
                                    <label className="text-sm font-bold text-slate-700">Company</label>
                                    <select
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        value={newVisit.companyId}
                                        onChange={(e) => setNewVisit({ ...newVisit, companyId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Company</option>
                                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700">Application Deadline</label>
                                    <input
                                        type="datetime-local"
                                        step="any"
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        value={newVisit.deadline}
                                        onChange={(e) => setNewVisit({ ...newVisit, deadline: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-slate-900">Job Roles</h3>
                                        <Button type="button" size="sm" variant="outline" onClick={handleAddRoleField}>
                                            <Plus size={16} className="mr-1" /> Add Role
                                        </Button>
                                    </div>
                                    {newVisit.jobRoles.map((role, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
                                            {idx > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveRoleField(idx)}
                                                    className="absolute top-2 right-2 text-rose-500 hover:text-rose-700"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    placeholder="Job Title"
                                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                    value={role.title}
                                                    onChange={(e) => {
                                                        const roles = [...newVisit.jobRoles];
                                                        roles[idx].title = e.target.value;
                                                        setNewVisit({ ...newVisit, jobRoles: roles });
                                                    }}
                                                    required
                                                />
                                                <input
                                                    placeholder="Package (LPA)"
                                                    type="number"
                                                    step="0.1"
                                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                    value={role.package}
                                                    onChange={(e) => {
                                                        const roles = [...newVisit.jobRoles];
                                                        roles[idx].package = e.target.value;
                                                        setNewVisit({ ...newVisit, jobRoles: roles });
                                                    }}
                                                    required
                                                />
                                            </div>
                                            <textarea
                                                placeholder="Package Details / Description"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                                                rows={2}
                                                value={role.packageDetails}
                                                onChange={(e) => {
                                                    const roles = [...newVisit.jobRoles];
                                                    roles[idx].packageDetails = e.target.value;
                                                    setNewVisit({ ...newVisit, jobRoles: roles });
                                                }}
                                                required
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    placeholder="CGPA Cutoff"
                                                    type="number"
                                                    step="0.01"
                                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                    value={role.cgpaCutoff}
                                                    onChange={(e) => {
                                                        const roles = [...newVisit.jobRoles];
                                                        roles[idx].cgpaCutoff = parseFloat(e.target.value);
                                                        setNewVisit({ ...newVisit, jobRoles: roles });
                                                    }}
                                                    required
                                                />
                                                <select
                                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                    value={role.slab}
                                                    onChange={(e) => {
                                                        const roles = [...newVisit.jobRoles];
                                                        roles[idx].slab = e.target.value;
                                                        setNewVisit({ ...newVisit, jobRoles: roles });
                                                    }}
                                                >
                                                    <option value="Dream">Dream</option>
                                                    <option value="OpenDream">Open Dream</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setShowAddVisitModal(false)}>Cancel</Button>
                                    <Button type="submit">Schedule Visit</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Manage Job Role Modal */}
            <AnimatePresence>
                {showManageRoleModal && selectedJobRole && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 h-[80vh] flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Manage Applications</h2>
                                    <p className="text-slate-500">{selectedJobRole.title} - {selectedCompany?.name || selectedJobRole.company?.name}</p>
                                </div>
                                <button onClick={() => setShowManageRoleModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex gap-2 mb-6 border-b border-slate-200">
                                {['applied', 'oa', 'interview'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => fetchApplications(selectedJobRole.id, tab)}
                                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === tab
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {tab === 'applied' && 'All Applicants'}
                                        {tab === 'oa' && 'OA Shortlist'}
                                        {tab === 'interview' && 'Interview Shortlist'}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-auto mb-6">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead className="sticky top-0 bg-white z-10">
                                        <tr className="border-b border-slate-200">
                                            <th className="px-4 py-3 w-10">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedApplicationIds(roleApplications.map(a => a.studentId));
                                                        } else {
                                                            setSelectedApplicationIds([]);
                                                        }
                                                    }}
                                                    checked={roleApplications.length > 0 && selectedApplicationIds.length === roleApplications.length}
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Student</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">CGPA</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">10th %</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">12th %</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Phone</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Address</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Resume</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Department</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {roleApplications.map((app) => (
                                            <tr key={app.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedApplicationIds.includes(app.studentId)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedApplicationIds([...selectedApplicationIds, app.studentId]);
                                                            } else {
                                                                setSelectedApplicationIds(selectedApplicationIds.filter(id => id !== app.studentId));
                                                            }
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-900">{app.student.name}</div>
                                                    <div className="text-xs text-slate-500">{app.student.email}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">{app.student.profile?.cgpa || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm">{app.student.profile?.marks10 || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm">{app.student.profile?.marks12 || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm">{app.student.profile?.phoneNo || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm max-w-[150px] truncate" title={app.student.profile?.address || ''}>
                                                    {app.student.profile?.address || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {app.student.profile?.resume ? (
                                                        <a
                                                            href={app.student.profile.resume}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-indigo-600 hover:underline"
                                                        >
                                                            View
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm">{app.student.department?.deptName}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={
                                                        app.status === 'offered' ? 'success' :
                                                            app.status === 'rejected' ? 'error' : 'info'
                                                    }>
                                                        {app.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        {roleApplications.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                                    No applications found for this stage.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                                <div className="text-sm text-slate-500">
                                    {selectedApplicationIds.length} students selected
                                </div>
                                <div className="flex gap-3">
                                    {activeTab !== 'interview' && (
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium text-slate-700">Next Stage Date:</label>
                                            <input
                                                type="datetime-local"
                                                step="any"
                                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                value={nextStageDate}
                                                onChange={(e) => setNextStageDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                    )}
                                    <Button
                                        onClick={handleUpdateShortlist}
                                        disabled={selectedApplicationIds.length === 0 || (activeTab !== 'interview' && !nextStageDate)}
                                    >
                                        {activeTab === 'applied' && 'Shortlist for OA'}
                                        {activeTab === 'oa' && 'Shortlist for Interview'}
                                        {activeTab === 'interview' && 'Release Final Offers'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Job Role Modal */}
            <AnimatePresence>
                {showAddJobRoleModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Add Job Role</h2>
                                <button onClick={() => setShowAddJobRoleModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAddJobRole} className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700">Job Title</label>
                                    <input
                                        type="text"
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        value={newJobRole.title}
                                        onChange={(e) => setNewJobRole({ ...newJobRole, title: e.target.value })}
                                        placeholder="e.g. SDE-1"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-slate-700">Package (LPA)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                            value={newJobRole.package}
                                            onChange={(e) => setNewJobRole({ ...newJobRole, package: e.target.value })}
                                            placeholder="e.g. 12.5"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700">CGPA Cutoff</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                            value={newJobRole.cgpaCutoff}
                                            onChange={(e) => setNewJobRole({ ...newJobRole, cgpaCutoff: parseFloat(e.target.value) })}
                                            placeholder="e.g. 7.5"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700">Description / Details</label>
                                    <textarea
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                                        rows={3}
                                        value={newJobRole.packageDetails}
                                        onChange={(e) => setNewJobRole({ ...newJobRole, packageDetails: e.target.value })}
                                        placeholder="Role details..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700">Slab</label>
                                    <select
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        value={newJobRole.slab}
                                        onChange={(e) => setNewJobRole({ ...newJobRole, slab: e.target.value })}
                                    >
                                        <option value="Dream">Dream</option>
                                        <option value="OpenDream">Open Dream</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700">Application Deadline</label>
                                    <input
                                        type="datetime-local"
                                        step="any"
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        value={newJobRole.applicationDeadline}
                                        onChange={(e) => setNewJobRole({ ...newJobRole, applicationDeadline: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setShowAddJobRoleModal(false)}>Cancel</Button>
                                    <Button type="submit">Add Role</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Student Profile Modal */}
            <AnimatePresence>
                {selectedStudent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="h-32 bg-indigo-600 relative">
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
                                >
                                    <Plus size={20} className="rotate-45" />
                                </button>
                            </div>
                            <div className="px-8 pb-8">
                                <div className="relative -mt-16 mb-6 flex items-end gap-6">
                                    <div className="w-32 h-32 bg-white rounded-2xl p-1 shadow-xl">
                                        <div className="w-full h-full bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-4xl font-bold">
                                            {selectedStudent.name?.charAt(0) || 'S'}
                                        </div>
                                    </div>
                                    <div className="pb-2">
                                        <h2 className="text-2xl font-bold text-slate-900">{selectedStudent.name || 'Incomplete Profile'}</h2>
                                        <p className="text-slate-500">{selectedStudent.email}</p>
                                    </div>
                                    <div className="ml-auto pb-2">
                                        <Badge variant={selectedStudent.placeStatus === 'unplaced' ? 'warning' : 'success'}>
                                            {selectedStudent.placeStatus}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Academic Details</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500 text-sm">Department</span>
                                                    <span className="text-slate-900 font-medium text-sm">{selectedStudent.department?.deptName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500 text-sm">Output Year</span>
                                                    <span className="text-slate-900 font-medium text-sm">{selectedStudent.outputYear}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500 text-sm">CGPA</span>
                                                    <span className="text-slate-900 font-medium text-sm">{selectedStudent.profile?.cgpa || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Information</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500 text-sm">Phone</span>
                                                    <span className="text-slate-900 font-medium text-sm">{selectedStudent.profile?.phoneNo || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500 text-sm">Address</span>
                                                    <span className="text-slate-900 font-medium text-sm truncate max-w-[150px]">{selectedStudent.profile?.address || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Placement Info</h3>
                                            {selectedStudent.placedJobRole ? (
                                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                                    <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Placed At</p>
                                                    <p className="font-bold text-emerald-900">{selectedStudent.placedJobRole.title}</p>
                                                    <p className="text-sm text-emerald-700">{selectedStudent.placedJobRole.company?.name}</p>
                                                    <p className="text-sm font-bold text-emerald-800 mt-2">₹{selectedStudent.placedJobRole.package.toLocaleString()}</p>
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                                    <p className="text-sm text-slate-500 italic">Not yet placed</p>
                                                </div>
                                            )}
                                        </div>
                                        <Button variant="outline" className="w-full">Download Resume</Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
