import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Award } from 'lucide-react';
import { Card, Button } from '../UI';
import type { CompanyStats } from './types';

interface CompanyViewProps {
    selectedCompany: CompanyStats;
    setSelectedVisitId: (id: number) => void;
    setShowAddJobRoleModal: (show: boolean) => void;
    handleManageRole: (role: any) => void;
    handleViewProfile: (studentId: number) => void;
}

export const CompanyView: React.FC<CompanyViewProps> = ({
    selectedCompany,
    setSelectedVisitId,
    setShowAddJobRoleModal,
    handleManageRole,
    handleViewProfile
}) => {
    return (
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
    );
};
