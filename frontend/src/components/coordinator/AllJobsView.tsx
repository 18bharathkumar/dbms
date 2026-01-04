import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Card, Badge, Button } from '../UI';
import type { JobRole } from './types';

interface AllJobsViewProps {
    allJobs: JobRole[];
    jobSearchTerm: string;
    setJobSearchTerm: (term: string) => void;
    handleManageRole: (job: JobRole) => void;
}

export const AllJobsView: React.FC<AllJobsViewProps> = ({
    allJobs,
    jobSearchTerm,
    setJobSearchTerm,
    handleManageRole
}) => {
    return (
        <motion.div
            key="all-jobs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex gap-4 mb-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search job roles..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        value={jobSearchTerm}
                        onChange={(e) => setJobSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allJobs
                    .filter(job => job.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) || job.company?.name.toLowerCase().includes(jobSearchTerm.toLowerCase()))
                    .map((job) => (
                        <Card key={job.id} className="p-6 hover:border-indigo-200 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                                    <p className="text-sm text-slate-500">{job.company?.name}</p>
                                </div>
                                <Badge variant={job.slab === 'Dream' ? 'warning' : 'info'}>{job.slab}</Badge>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Package</span>
                                    <span className="font-semibold text-slate-900">₹{job.package.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">CGPA Cutoff</span>
                                    <span className="font-semibold text-slate-900">{job.cgpaCutoff}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Deadline</span>
                                    <span className="font-semibold text-slate-900">{new Date(job.applicationDeadline).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm items-center pt-2 border-t border-slate-100 mt-2">
                                    <span className="text-slate-500">Status</span>
                                    <Badge variant={
                                        job.currentStage === 'APPLICATION_OPEN' ? 'success' :
                                            job.currentStage === 'FINAL_RESULT_ANNOUNCED' ? 'info' : 'warning'
                                    }>
                                        {job.currentStage?.replace(/_/g, ' ') || 'OPEN'}
                                    </Badge>
                                </div>
                            </div>

                            <Button className="w-full" onClick={() => handleManageRole(job)}>
                                Manage Applications of {job.company?.name}
                            </Button>
                        </Card>
                    ))}
            </div>
        </motion.div>
    );
};
