import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Card, Badge } from '../UI';
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
    return (
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
    );
};
