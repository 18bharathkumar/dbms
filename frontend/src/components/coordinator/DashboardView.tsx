import React from 'react';
import { motion } from 'framer-motion';
import { Users, CalendarCheck, Building2, TrendingUp, ChevronRight } from 'lucide-react';
import { Card } from '../UI';
import type { DeptStats, Company } from './types';

interface DashboardViewProps {
    totalStudents: number;
    totalPlaced: number;
    companies: Company[];
    deptStats: DeptStats[];
    handleViewDept: (dept: DeptStats) => void;
    handleViewCompany: (companyId: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
    totalStudents,
    totalPlaced,
    companies,
    deptStats,
    handleViewDept,
    handleViewCompany
}) => {
    return (
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
    );
};
