import React, { useEffect, useState } from 'react';
import { Card, Badge } from '../components/UI';
import {
    Users,
    Building2,
    ChevronRight,
    ArrowLeft,
    TrendingUp,
    Award,
    Calendar,
    X
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
    outputYear: number;
    profile?: any;
    placedJobRole?: any;
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

type View = 'stats' | 'department' | 'company';

export const StatisticsPage: React.FC = () => {
    const [view, setView] = useState<View>('stats');
    const [deptStats, setDeptStats] = useState<DeptStats[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedDept, setSelectedDept] = useState<DeptStats | null>(null);
    const [deptStudents, setDeptStudents] = useState<Student[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<CompanyStats | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() + 1);

    useEffect(() => {
        fetchInitialData();
    }, [selectedYear]);

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
            console.error('Failed to fetch stats data', err);
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

    const totalStudents = deptStats.reduce((acc, d) => acc + d.totalStudents, 0);
    const totalPlaced = deptStats.reduce((acc, d) => acc + d.placedStudents, 0);

    if (loading && view === 'stats') return <div className="flex items-center justify-center h-64">Loading...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    {view !== 'stats' && (
                        <button
                            onClick={() => setView('stats')}
                            className="flex items-center gap-2 text-indigo-600 font-medium mb-2 hover:underline"
                        >
                            <ArrowLeft size={16} />
                            Back to Statistics
                        </button>
                    )}
                    <h1 className="text-3xl font-bold text-slate-900">
                        {view === 'stats' && 'Placement Statistics'}
                        {view === 'department' && `${selectedDept?.deptName} Department`}
                        {view === 'company' && `${selectedCompany?.name} Statistics`}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {view === 'stats' && 'Comprehensive overview of placement performance and hiring history.'}
                        {view === 'department' && 'Viewing students and placement details for this department.'}
                        {view === 'company' && 'Detailed hiring history and visit statistics.'}
                    </p>
                </div>
                {view === 'stats' && (
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
                )}
            </div>

            <AnimatePresence mode="wait">
                {view === 'stats' && (
                    <motion.div
                        key="stats"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-10"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Placed Students', value: totalPlaced, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
                                Department Performance
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
                                Company Hiring History
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
                                                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                                                    {visit.totalHired} Hired
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
                                                        <div className="flex items-center gap-2">
                                                            <Award size={14} className="text-amber-500" />
                                                            <span className="text-sm text-slate-600">{role.hiredCount} Students Hired</span>
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
                    </motion.div>
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
                                    <X size={20} />
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
