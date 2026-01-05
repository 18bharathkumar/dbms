import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, User } from 'lucide-react';
import { Card, Badge, Button } from '../UI';
import type { Student } from './types';

interface AllStudentsViewProps {
    allStudents: Student[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    handleViewProfile: (studentId: number) => void;
}

export const AllStudentsView: React.FC<AllStudentsViewProps> = ({
    allStudents,
    searchTerm,
    setSearchTerm,
    handleViewProfile
}) => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [deptFilter, setDeptFilter] = useState<string>('all');
    const [yearFilter, setYearFilter] = useState<string>('all');

    const departments = useMemo(() => {
        const depts = new Set(allStudents.map(s => s.department?.deptName).filter(Boolean));
        return Array.from(depts).sort();
    }, [allStudents]);

    const outputYears = useMemo(() => {
        const years = new Set(allStudents.map(s => s.outputYear).filter(Boolean));
        return Array.from(years).sort((a, b) => (b as number) - (a as number));
    }, [allStudents]);

    const filteredStudents = useMemo(() => {
        return allStudents.filter(s => {
            const matchesSearch =
                s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.department?.deptName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || s.placeStatus === statusFilter;
            const matchesDept = deptFilter === 'all' || s.department?.deptName === deptFilter;
            const matchesYear = yearFilter === 'all' || s.outputYear?.toString() === yearFilter;

            return matchesSearch && matchesStatus && matchesDept && matchesYear;
        });
    }, [allStudents, searchTerm, statusFilter, deptFilter, yearFilter]);

    return (
        <motion.div
            key="all-students"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row gap-4">
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
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                        <Filter size={16} className="text-slate-400" />
                        <select
                            className="text-sm font-medium text-slate-700 outline-none bg-transparent"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="unplaced">Unplaced</option>
                            <option value="Dream">Dream</option>
                            <option value="OpenDream">Open Dream</option>
                        </select>
                    </div>

                    <select
                        className="text-sm font-medium text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 outline-none"
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                    >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>

                    <select
                        className="text-sm font-medium text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 outline-none"
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                    >
                        <option value="all">All Years</option>
                        {outputYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Year</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                                    {student.name?.charAt(0) || <User size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{student.name || 'Incomplete Profile'}</p>
                                                    <p className="text-xs text-slate-500">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{student.department?.deptName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{student.outputYear}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                student.placeStatus === 'unplaced' ? 'warning' :
                                                    student.placeStatus === 'OpenDream' ? 'success' : 'info'
                                            }>
                                                {student.placeStatus}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewProfile(student.id)}
                                            >
                                                View Profile
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No students found matching the filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </motion.div>
    );
};
