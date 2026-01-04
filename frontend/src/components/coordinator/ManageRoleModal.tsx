import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button, Badge } from '../UI';
import type { JobRole } from './types';

interface ManageRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedJobRole: JobRole | null;
    roleApplications: any[];
    activeTab: 'applied' | 'oa' | 'interview';
    fetchApplications: (roleId: number, status: string) => void;
    selectedApplicationIds: number[];
    setSelectedApplicationIds: (ids: number[]) => void;
    nextStageDate: string;
    setNextStageDate: (date: string) => void;
    handleUpdateShortlist: () => void;
}

export const ManageRoleModal: React.FC<ManageRoleModalProps> = ({
    isOpen,
    onClose,
    selectedJobRole,
    roleApplications,
    activeTab,
    fetchApplications,
    selectedApplicationIds,
    setSelectedApplicationIds,
    nextStageDate,
    setNextStageDate,
    handleUpdateShortlist
}) => {
    return (
        <AnimatePresence>
            {isOpen && selectedJobRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 h-[80vh] flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Manage Applications</h2>
                                <p className="text-slate-500">{selectedJobRole.title} - {selectedJobRole.company?.name}</p>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex gap-2 mb-6 border-b border-slate-200">
                            {['applied', 'oa', 'interview'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => fetchApplications(selectedJobRole.id, tab)}
                                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === tab
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

                        <div className="flex-1 overflow-auto mb-6">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr className="border-b border-slate-200">
                                        <th className="px-4 py-3 w-10">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedApplicationIds(roleApplications.map(a => a.studentId));
                                                    } else {
                                                        setSelectedApplicationIds([]);
                                                    }
                                                }}
                                                checked={roleApplications.length > 0 && selectedApplicationIds.length === roleApplications.length}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Student</th>
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
                                    {roleApplications.map((app) => (
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
                                                <div className="text-xs text-slate-500">{app.student.email}</div>
                                            </td>
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
                                                    app.status === 'offered' ? 'success' :
                                                        app.status === 'rejected' ? 'error' : 'info'
                                                }>
                                                    {app.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                    {roleApplications.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                                                No applications found for this stage.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                            <div className="text-sm text-slate-500">
                                {selectedApplicationIds.length} students selected
                            </div>
                            <div className="flex gap-3">
                                {activeTab !== 'interview' && (
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-slate-700">Next Stage Date:</label>
                                        <input
                                            type="datetime-local"
                                            step="any"
                                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                            value={nextStageDate}
                                            onChange={(e) => setNextStageDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}
                                <Button
                                    onClick={handleUpdateShortlist}
                                    disabled={selectedApplicationIds.length === 0 || (activeTab !== 'interview' && !nextStageDate)}
                                >
                                    {activeTab === 'applied' && 'Shortlist for OA'}
                                    {activeTab === 'oa' && 'Shortlist for Interview'}
                                    {activeTab === 'interview' && 'Release Final Offers'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
