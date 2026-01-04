import React from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, Plus, ChevronRight } from 'lucide-react';
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
    return (
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
    );
};
