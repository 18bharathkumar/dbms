import React from 'react';
import { ArrowLeft, Calendar, Users, Edit2 } from 'lucide-react';
import { Button } from '../UI';

interface DashboardHeaderProps {
    view: string;
    setView: (view: any) => void;
    selectedDeptName?: string;
    selectedCompanyName?: string;
    selectedYear: number;
    setSelectedYear: (year: number) => void;
    handleViewAllStudents: () => void;
    setShowAddDeptModal: (show: boolean) => void;
    onEditCompany?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    view,
    setView,
    selectedDeptName,
    selectedCompanyName,
    selectedYear,
    setSelectedYear,
    handleViewAllStudents,
    setShowAddDeptModal,
    onEditCompany
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                {view !== 'dashboard' && (
                    <button
                        onClick={() => setView('dashboard')}
                        className="flex items-center gap-2 text-indigo-600 font-medium mb-2 hover:underline"
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>
                )}
                {view === 'company' && selectedCompanyName && (
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold text-slate-900">{selectedCompanyName}</h1>
                        <button
                            onClick={onEditCompany}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Company Name"
                        >
                            <Edit2 size={18} />
                        </button>
                    </div>
                )}
                {view !== 'company' && (
                    <h1 className="text-3xl font-bold text-slate-900">
                        {view === 'dashboard' && 'Placement Dashboard'}
                        {view === 'department' && `${selectedDeptName} Department`}
                        {view === 'all-students' && 'All Students'}
                        {view === 'all-applications' && 'All Applications'}
                        {view === 'all-companies' && 'Manage Companies'}
                        {view === 'all-jobs' && 'Manage Job Roles'}
                    </h1>
                )}
                <p className="text-slate-500 mt-1">
                    {view === 'dashboard' && 'Manage placements, companies, and student applications.'}
                    {view === 'department' && 'Viewing students and placement details for this department.'}
                    {view === 'company' && 'Detailed hiring history and visit statistics.'}
                    {view === 'all-students' && 'Complete list of all students across departments.'}
                    {view === 'all-companies' && 'View and manage all registered companies and visits.'}
                    {view === 'all-jobs' && 'View and manage all job applications.'}
                </p>
            </div>
            {view === 'dashboard' && (
                <div className="flex flex-wrap gap-3">
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
                    <Button variant="outline" className="gap-2" onClick={handleViewAllStudents}>
                        <Users size={18} />
                        All Students
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => setShowAddDeptModal(true)}>
                        <Users size={18} />
                        Add Dept
                    </Button>
                </div>
            )}
        </div>
    );
};
