import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, Plus, ChevronRight, Filter } from 'lucide-react';
import { Card, Button } from '../UI';
import type { Company } from './types';

interface AllCompaniesViewProps {
    companies: Company[];
    companySearchTerm: string;
    setCompanySearchTerm: (term: string) => void;
    setShowAddCompanyModal: (show: boolean) => void;
    setShowAddVisitModal: (show: boolean) => void;
    handleViewCompany: (companyId: number) => void;
}

export const AllCompaniesView: React.FC<AllCompaniesViewProps> = ({
    companies,
    companySearchTerm,
    setCompanySearchTerm,
    setShowAddCompanyModal,
    setShowAddVisitModal,
    handleViewCompany
}) => {
    const [yearFilter, setYearFilter] = useState<string>('all');

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
            const matchesSearch = c.name.toLowerCase().includes(companySearchTerm.toLowerCase());
            const matchesYear = yearFilter === 'all' ||
                c.companyVisits?.some(v => v.academicYear.year.toString() === yearFilter);
            return matchesSearch && matchesYear;
        });
    }, [companies, companySearchTerm, yearFilter]);

    return (
        <motion.div
            key="all-companies"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex flex-1 gap-4 max-w-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            value={companySearchTerm}
                            onChange={(e) => setCompanySearchTerm(e.target.value)}
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
                {filteredCompanies.map((company) => (
                    <Card
                        key={company.id}
                        className="flex items-center justify-between p-4 hover:border-indigo-200 transition-all cursor-pointer group"
                        onClick={() => handleViewCompany(company.id)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                {company.name.charAt(0)}
                            </div>
                            <div>
                                <span className="font-semibold text-slate-900 block">{company.name}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold">
                                    {company.companyVisits?.length || 0} Visits
                                </span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600" />
                    </Card>
                ))}
            </div>

            {filteredCompanies.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-500">No companies found matching your criteria.</p>
                </div>
            )}
        </motion.div>
    );
};
