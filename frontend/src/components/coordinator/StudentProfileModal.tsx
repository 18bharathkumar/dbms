import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button, Badge } from '../UI';
import type { Student } from './types';

interface StudentProfileModalProps {
    selectedStudent: Student | null;
    onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
    selectedStudent,
    onClose
}) => {
    return (
        <AnimatePresence>
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="h-32 bg-indigo-600 relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
                            >
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>
                        <div className="px-8 pb-8">
                            <div className="relative -mt-16 mb-6 flex items-end gap-6">
                                <div className="w-32 h-32 bg-white rounded-2xl p-1 shadow-xl">
                                    <div className="w-full h-full bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-4xl font-bold">
                                        {selectedStudent.name?.charAt(0) || 'S'}
                                    </div>
                                </div>
                                <div className="pb-2">
                                    <h2 className="text-2xl font-bold text-slate-900">{selectedStudent.name || 'Incomplete Profile'}</h2>
                                    <p className="text-slate-500">{selectedStudent.email}</p>
                                </div>
                                <div className="ml-auto pb-2">
                                    <Badge variant={selectedStudent.placeStatus === 'unplaced' ? 'warning' : 'success'}>
                                        {selectedStudent.placeStatus}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Academic Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 text-sm">Department</span>
                                                <span className="text-slate-900 font-medium text-sm">{selectedStudent.department?.deptName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 text-sm">Output Year</span>
                                                <span className="text-slate-900 font-medium text-sm">{selectedStudent.outputYear}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 text-sm">CGPA</span>
                                                <span className="text-slate-900 font-medium text-sm">{selectedStudent.profile?.cgpa || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 text-sm">Phone</span>
                                                <span className="text-slate-900 font-medium text-sm">{selectedStudent.profile?.phoneNo || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500 text-sm">Address</span>
                                                <span className="text-slate-900 font-medium text-sm truncate max-w-[150px]">{selectedStudent.profile?.address || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Placement Info</h3>
                                        {selectedStudent.placedJobRole ? (
                                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Placed At</p>
                                                <p className="font-bold text-emerald-900">{selectedStudent.placedJobRole.title}</p>
                                                <p className="text-sm text-emerald-700">{selectedStudent.placedJobRole.company?.name}</p>
                                                <p className="text-sm font-bold text-emerald-800 mt-2">₹{selectedStudent.placedJobRole.package.toLocaleString()}</p>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                                <p className="text-sm text-slate-500 italic">Not yet placed</p>
                                            </div>
                                        )}
                                    </div>
                                    <Button variant="outline" className="w-full">Download Resume</Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
