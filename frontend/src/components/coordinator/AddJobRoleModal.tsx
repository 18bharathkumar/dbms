import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../UI';

interface AddJobRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    newJobRole: any;
    setNewJobRole: (role: any) => void;
}

export const AddJobRoleModal: React.FC<AddJobRoleModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    newJobRole,
    setNewJobRole
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Add Job Role</h2>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700">Job Title</label>
                                <input
                                    type="text"
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    value={newJobRole.title}
                                    onChange={(e) => setNewJobRole({ ...newJobRole, title: e.target.value })}
                                    placeholder="e.g. SDE-1"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700">Package (LPA)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        value={newJobRole.package}
                                        onChange={(e) => setNewJobRole({ ...newJobRole, package: e.target.value })}
                                        placeholder="e.g. 12.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700">CGPA Cutoff</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                        value={newJobRole.cgpaCutoff}
                                        onChange={(e) => setNewJobRole({ ...newJobRole, cgpaCutoff: parseFloat(e.target.value) })}
                                        placeholder="e.g. 7.5"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700">Description / Details</label>
                                <textarea
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                                    rows={3}
                                    value={newJobRole.packageDetails}
                                    onChange={(e) => setNewJobRole({ ...newJobRole, packageDetails: e.target.value })}
                                    placeholder="Role details..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700">Slab</label>
                                <select
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    value={newJobRole.slab}
                                    onChange={(e) => setNewJobRole({ ...newJobRole, slab: e.target.value })}
                                >
                                    <option value="Dream">Dream</option>
                                    <option value="OpenDream">Open Dream</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-700">Application Deadline</label>
                                <input
                                    type="datetime-local"
                                    step="any"
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                    value={newJobRole.applicationDeadline}
                                    onChange={(e) => setNewJobRole({ ...newJobRole, applicationDeadline: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                                <Button type="submit">Add Role</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
