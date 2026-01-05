import React, { useEffect, useState, useMemo } from 'react';
import { Card, Badge, Button } from '../components/UI';
import {
    Building2,
    Search,
    Filter,
    ChevronRight,
    ArrowLeft,
    Calendar,
    Award,
    DollarSign,
    Users,
    X
} from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

interface Company {
    id: number;
    name: string;
    companyVisits?: {
        id: number;
        visitDate: string;
        academicYear: {
            year: number;
        };
    }[];
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

export const StudentCompanies: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<CompanyStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState<string>('all');
    const [view, setView] = useState<'list' | 'detail'>('list');

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const res = await api.get('/companies');
            setCompanies(res.data);
        } catch (err) {
            console.error('Failed to fetch companies', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewCompany = async (companyId: number) => {
        setLoading(true);
        try {
            const res = await api.get(`/companies/${companyId}/stats`);
            setSelectedCompany(res.data);
            setView('detail');
        } catch (err) {
            console.error('Failed to fetch company details', err);
        } finally {
            setLoading(false);
        }
    };

    const availableYears = useMemo(() => {
        const years = new Set<number>();
        companies.forEach(c => {
            c.companyVisits?.forEach(v => {
                years.add(v.academicYear.year);
            });
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [companies]);

    const filteredCompanies = useMemo(() => {
        return companies.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesYear = yearFilter === 'all' ||
                c.companyVisits?.some(v => v.academicYear.year.toString() === yearFilter);
            return matchesSearch && matchesYear;
        });
    }, [companies, searchTerm, yearFilter]);

    if (loading && view === 'list') {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <AnimatePresence mode="wait">
                {view === 'list' ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Partner Companies</h1>
                                <p className="text-slate-500 mt-1">Explore companies that visit our campus for recruitment.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search companies..."
                                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                                    <Filter size={16} className="text-slate-400" />
                                    <select
                                        className="text-sm font-medium text-slate-700 outline-none bg-transparent"
                                        value={yearFilter}
                                        onChange={(e) => setYearFilter(e.target.value)}
                                    >
                                        <option value="all">All Years</option>
                                        {availableYears.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {filteredCompanies.map((company) => (
                                <Card
                                    key={company.id}
                                    className="flex items-center justify-between p-5 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group"
                                    onClick={() => handleViewCompany(company.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                            {company.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{company.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                                                {company.companyVisits?.length || 0} Recruitment Visits
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                </Card>
                            ))}
                        </div>

                        {filteredCompanies.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                <Building2 size={48} className="mx-auto text-slate-200 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900">No companies found</h3>
                                <p className="text-slate-500">Try adjusting your search or filter criteria.</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <button
                            onClick={() => setView('list')}
                            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors font-medium"
                        >
                            <ArrowLeft size={20} />
                            Back to Companies
                        </button>

                        {selectedCompany && (
                            <div className="space-y-8">
                                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
                                    <div className="relative z-10 flex items-center gap-6">
                                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
                                            <Building2 size={40} />
                                        </div>
                                        <div>
                                            <h1 className="text-4xl font-bold">{selectedCompany.name}</h1>
                                            <p className="text-indigo-100 mt-1 flex items-center gap-2">
                                                <Calendar size={16} />
                                                Recruitment History
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl" />
                                </div>

                                <div className="space-y-10">
                                    {selectedCompany.statsByYear.map((yearStat) => (
                                        <div key={yearStat.year} className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-px flex-1 bg-slate-200" />
                                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                                                    <Calendar className="text-indigo-600" size={20} />
                                                    Academic Year {yearStat.year}
                                                </h3>
                                                <div className="h-px flex-1 bg-slate-200" />
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {yearStat.visits.map((visit, idx) => (
                                                    <Card key={visit.id} className="p-6 hover:shadow-md transition-shadow">
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div>
                                                                <h4 className="text-lg font-bold text-slate-900">Visit #{yearStat.visits.length - idx}</h4>
                                                                <p className="text-sm text-slate-500">{new Date(visit.date).toLocaleDateString()}</p>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border border-emerald-100">
                                                                    <Users size={16} />
                                                                    {visit.totalHired} Hired
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Offered Roles</p>
                                                            <div className="grid gap-3">
                                                                {visit.roles.map((role) => (
                                                                    <div key={role.id} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-indigo-100 transition-all">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-50">
                                                                                <Award size={20} />
                                                                            </div>
                                                                            <div>
                                                                                <h5 className="font-bold text-slate-900">{role.title}</h5>
                                                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                                                    <Users size={12} />
                                                                                    {role.hiredCount} selected
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-lg font-bold text-emerald-600 flex items-center gap-1">
                                                                                <DollarSign size={16} />
                                                                                {(role.package || 0).toLocaleString()}
                                                                            </div>
                                                                            <p className="text-[10px] text-slate-400 font-bold uppercase">per annum</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
