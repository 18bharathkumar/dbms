import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { Button } from '../UI';
import type { Company } from './types';

interface AddVisitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    companies: Company[];
    newVisit: any;
    setNewVisit: (visit: any) => void;
    handleAddRoleField: () => void;
    handleRemoveRoleField: (index: number) => void;
}

export const AddVisitModal: React.FC<AddVisitModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    companies,
    newVisit,
    setNewVisit,
    handleAddRoleField,
    handleRemoveRoleField
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Schedule New Visit</h2>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-slate-700">Company</label>
                                <select
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    value={newVisit.companyId}
                                    onChange={(e) => setNewVisit({ ...newVisit, companyId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Company</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700">Application Deadline</label>
                                <input
                                    type="datetime-local"
                                    step="any"
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    value={newVisit.deadline}
                                    onChange={(e) => setNewVisit({ ...newVisit, deadline: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900">Job Roles</h3>
                                    <Button type="button" size="sm" variant="outline" onClick={handleAddRoleField}>
                                        <Plus size={16} className="mr-1" /> Add Role
                                    </Button>
                                </div>
                                {newVisit.jobRoles.map((role: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
                                        {idx > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRoleField(idx)}
                                                className="absolute top-2 right-2 text-rose-500 hover:text-rose-700"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                placeholder="Job Title"
                                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                value={role.title}
                                                onChange={(e) => {
                                                    const roles = [...newVisit.jobRoles];
                                                    roles[idx].title = e.target.value;
                                                    setNewVisit({ ...newVisit, jobRoles: roles });
                                                }}
                                                required
                                            />
                                            <input
                                                placeholder="Package (LPA)"
                                                type="number"
                                                step="0.1"
                                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                value={role.package}
                                                onChange={(e) => {
                                                    const roles = [...newVisit.jobRoles];
                                                    roles[idx].package = e.target.value;
                                                    setNewVisit({ ...newVisit, jobRoles: roles });
                                                }}
                                                required
                                            />
                                        </div>
                                        <textarea
                                            placeholder="Package Details / Description"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                                            rows={2}
                                            value={role.packageDetails}
                                            onChange={(e) => {
                                                const roles = [...newVisit.jobRoles];
                                                roles[idx].packageDetails = e.target.value;
                                                setNewVisit({ ...newVisit, jobRoles: roles });
                                            }}
                                            required
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                placeholder="CGPA Cutoff"
                                                type="number"
                                                step="0.01"
                                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                value={role.cgpaCutoff}
                                                onChange={(e) => {
                                                    const roles = [...newVisit.jobRoles];
                                                    roles[idx].cgpaCutoff = parseFloat(e.target.value);
                                                    setNewVisit({ ...newVisit, jobRoles: roles });
                                                }}
                                                required
                                            />
                                            <select
                                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                value={role.slab}
                                                onChange={(e) => {
                                                    const roles = [...newVisit.jobRoles];
                                                    roles[idx].slab = e.target.value;
                                                    setNewVisit({ ...newVisit, jobRoles: roles });
                                                }}
                                            >
                                                <option value="Dream">Dream</option>
                                                <option value="OpenDream">Open Dream</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                                <Button type="submit">Schedule Visit</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
