import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { Button, Badge } from '../UI';
import type { JobRole } from './types';
import * as XLSX from 'xlsx';

interface ManageRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedJobRole: JobRole | null;
    roleApplications: any[];
    roleApplicationsError: string | null;
    actionError: string | null;
    activeTab: 'applied' | 'oa' | 'interview';
    fetchApplications: (roleId: number, status: string) => void;
    selectedApplicationIds: number[];
    setSelectedApplicationIds: (ids: number[]) => void;
    handleUpdateShortlist: () => void;
}

export const ManageRoleModal: React.FC<ManageRoleModalProps> = ({
    isOpen,
    onClose,
    selectedJobRole,
    roleApplications,
    roleApplicationsError,
    actionError,
    activeTab,
    fetchApplications,
    selectedApplicationIds,
    setSelectedApplicationIds,
    handleUpdateShortlist
}) => {
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredApplications = useMemo(() => {
        if (activeTab !== 'applied' || statusFilter === 'all') return roleApplications;
        return roleApplications.filter(app => app.status === statusFilter);
    }, [roleApplications, activeTab, statusFilter]);

    const handleDownloadExcel = () => {
        if (!filteredApplications.length || !selectedJobRole) return;

        const data = filteredApplications.map(app => ({
            'Student Name': app.student.name,
            'Email': app.student.email,
            'Department': app.student.department?.deptName || 'N/A',
            'CGPA': app.student.profile?.cgpa || 'N/A',
            '10th %': app.student.profile?.marks10 || 'N/A',
            '12th %': app.student.profile?.marks12 || 'N/A',
            'Phone': app.student.profile?.phoneNo || 'N/A',
            'Address': app.student.profile?.address || 'N/A',
            'Resume Link': app.student.profile?.resume || 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

        const fileName = `${selectedJobRole.company?.name}_${selectedJobRole.title}_${activeTab}_${new Date().toLocaleString()}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    return (
        <AnimatePresence>
            {isOpen && selectedJobRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-[95vw] bg-white rounded-2xl shadow-xl p-6 h-[90vh] flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Manage Applications</h2>
                                <p className="text-slate-500">{selectedJobRole.title} - {selectedJobRole.company?.name}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={handleDownloadExcel}
                                    disabled={roleApplications.length === 0}
                                >
                                    <Download size={16} />
                                    Download Excel
                                </Button>
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-200 pb-2">
                            <div className="flex gap-2">
                                {['applied', 'oa', 'interview'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            setStatusFilter('all');
                                            fetchApplications(selectedJobRole.id, tab);
                                        }}
                                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors -mb-[9px] ${activeTab === tab
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {tab === 'applied' && 'All Applicants'}
                                        {tab === 'oa' && 'OA Shortlist'}
                                        {tab === 'interview' && 'Interview Shortlist'}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'applied' && (
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter Status:</span>
                                    <select
                                        className="text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="APPLIED">Applied</option>
                                        <option value="SELECTED_FOR_OA">Selected for OA</option>
                                        <option value="SELECTED_FOR_INTERVIEW">Selected for Interview</option>
                                        <option value="OFFERED">Offered</option>
                                        <option value="REJECTED">Rejected</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-auto mb-6">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr className="border-b border-slate-200">
                                        <th className="px-4 py-3 w-10">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedApplicationIds(filteredApplications.map(a => a.studentId));
                                                    } else {
                                                        setSelectedApplicationIds([]);
                                                    }
                                                }}
                                                checked={filteredApplications.length > 0 && selectedApplicationIds.length === filteredApplications.length}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Student</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">CGPA</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">10th %</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">12th %</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Phone</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Address</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Resume</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Department</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {roleApplicationsError ? (
                                        <tr>
                                            <td colSpan={11} className="px-4 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
                                                        <X size={24} />
                                                    </div>
                                                    <p className="text-slate-900 font-semibold">{roleApplicationsError}</p>
                                                    <p className="text-sm text-slate-500">Please complete the previous stages first.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredApplications.map((app) => (
                                        <tr key={app.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedApplicationIds.includes(app.studentId)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedApplicationIds([...selectedApplicationIds, app.studentId]);
                                                        } else {
                                                            setSelectedApplicationIds(selectedApplicationIds.filter(id => id !== app.studentId));
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">{app.student.name}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{app.student.email}</td>
                                            <td className="px-4 py-3 text-sm">{app.student.profile?.cgpa || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm">{app.student.profile?.marks10 || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm">{app.student.profile?.marks12 || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm">{app.student.profile?.phoneNo || 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm max-w-[150px] truncate" title={app.student.profile?.address || ''}>
                                                {app.student.profile?.address || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {app.student.profile?.resume ? (
                                                    <a
                                                        href={app.student.profile.resume}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 hover:underline"
                                                    >
                                                        View
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm">{app.student.department?.deptName}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={
                                                    app.status === 'OFFERED' ? 'success' :
                                                        app.status === 'REJECTED' ? 'error' :
                                                            app.status === 'APPLIED' ? 'info' : 'warning'
                                                }>
                                                    {app.status.replace(/_/g, ' ')}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                    {!roleApplicationsError && filteredApplications.length === 0 && (
                                        <tr>
                                            <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                                                No applications found for this stage.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-slate-200 pt-4 flex flex-col gap-4">
                            {actionError && (
                                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 animate-shake">
                                    <X size={16} className="shrink-0" />
                                    {actionError}
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-slate-500">
                                    {selectedApplicationIds.length} students selected
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleUpdateShortlist}
                                        disabled={selectedApplicationIds.length === 0}
                                    >
                                        {activeTab === 'applied' && 'Shortlist for OA'}
                                        {activeTab === 'oa' && 'Shortlist for Interview'}
                                        {activeTab === 'interview' && 'Release Final Offers'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
