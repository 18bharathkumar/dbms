import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
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
    const [slabFilter, setSlabFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredJobs = useMemo(() => {
        return allJobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
                job.company?.name.toLowerCase().includes(jobSearchTerm.toLowerCase());
            const matchesSlab = slabFilter === 'all' || job.slab === slabFilter;
            const matchesStatus = statusFilter === 'all' || job.currentStage === statusFilter;

            return matchesSearch && matchesSlab && matchesStatus;
        });
    }, [allJobs, jobSearchTerm, slabFilter, statusFilter]);

    return (
        <motion.div
            key="all-jobs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search job roles..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        value={jobSearchTerm}
                        onChange={(e) => setJobSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 md:flex-none">
                        <Filter size={16} className="text-slate-400" />
                        <select
                            className="text-sm font-medium text-slate-700 outline-none bg-transparent w-full"
                            value={slabFilter}
                            onChange={(e) => setSlabFilter(e.target.value)}
                        >
                            <option value="all">All Slabs</option>
                            <option value="Dream">Dream</option>
                            <option value="OpenDream">Open Dream</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 flex-1 md:flex-none">
                        <Filter size={16} className="text-slate-400" />
                        <select
                            className="text-sm font-medium text-slate-700 outline-none bg-transparent w-full"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="APPLICATION_OPEN">Application Open</option>
                            <option value="OA_SHORTLIST_DONE">OA Shortlist Done</option>
                            <option value="INTERVIEW_SHORTLIST_DONE">Interview Shortlist Done</option>
                            <option value="FINAL_RESULT_ANNOUNCED">Final Results Announced</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                    <Card key={job.id} className="p-6 hover:border-indigo-200 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
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
                                <span className="font-semibold text-slate-900">{new Date(job.applicationDeadline).toLocaleString()}</span>
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
                            Manage Applications
                        </Button>
                    </Card>
                ))}
            </div>

            {filteredJobs.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-500">No job roles found matching your criteria.</p>
                </div>
            )}
        </motion.div>
    );
};
