import React from 'react';
import { motion } from 'framer-motion';
import { Card, Badge } from '../UI';
import type { Application } from './types';

interface AllApplicationsViewProps {
    allApplications: Application[];
}

export const AllApplicationsView: React.FC<AllApplicationsViewProps> = ({ allApplications }) => {
    return (
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
                                            app.status === 'REJECTED' ? 'error' :
                                                app.status === 'APPLIED' ? 'info' : 'warning'
                                    }>
                                        {app.status.replace(/_/g, ' ')}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {new Date(app.createdAt).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </motion.div>
    );
};
