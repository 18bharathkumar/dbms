import React from 'react';
import { motion } from 'framer-motion';
import { Card, Badge } from '../UI';
import type { Student } from './types';

interface DepartmentViewProps {
    deptStudents: Student[];
    handleViewProfile: (studentId: number) => void;
}

export const DepartmentView: React.FC<DepartmentViewProps> = ({ deptStudents, handleViewProfile }) => {
    return (
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
    );
};
