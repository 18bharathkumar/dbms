import React, { useEffect, useState } from 'react';
import { Card, Badge, Button } from '../components/UI';
import { Briefcase, CheckCircle2, Search } from 'lucide-react';
import api from '../api';

import { useNavigate } from 'react-router-dom';

interface JobRole {
    id: number;
    title: string;
    package: number;
    applicationDeadline: string;
    slab: 'Dream' | 'OpenDream';
    company: {
        name: string;
    };
}

interface Application {
    id: number;
    status: string;
    jobRole: JobRole;
}

type FilterType = 'open' | 'closed';

export const StudentJobs: React.FC = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<JobRole[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);


    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<FilterType>('open');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [jobsRes, appsRes, studentRes] = await Promise.all([
                api.get('/companies/job-roles').catch(() => ({ data: [] })),
                api.get('/students/me/applications').catch(() => ({ data: [] })),
                api.get('/students/me/profile').catch(() => ({ data: null }))
            ]);
            setJobs(jobsRes.data);
            setApplications(appsRes.data);
            setStudent(studentRes.data);
        } catch (err) {
            console.error('Failed to fetch jobs data', err);
        } finally {
            setLoading(false);
        }
    };



    const filteredJobs = jobs.filter(job => {
        const isDeadlineOver = new Date(job.applicationDeadline) < new Date();
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.name.toLowerCase().includes(searchTerm.toLowerCase());

        // Filter based on open/closed status
        if (filter === 'open') {
            return !isDeadlineOver && matchesSearch;
        } else {
            return isDeadlineOver && matchesSearch;
        }
    });

    const openJobsCount = jobs.filter(job => new Date(job.applicationDeadline) >= new Date()).length;
    const closedJobsCount = jobs.filter(job => new Date(job.applicationDeadline) < new Date()).length;

    const getApplicationStatus = (job: JobRole) => {
        const studentStatus = student?.placeStatus;
        const jobSlab = job.slab;

        if (studentStatus === 'OpenDream') {
            return { allowed: false, reason: 'You are already placed in an OpenDream role.' };
        }
        if (studentStatus === 'Dream' && jobSlab !== 'OpenDream') {
            return { allowed: false, reason: 'You are placed in a Dream role. You can only apply for OpenDream roles.' };
        }
        return { allowed: true };
    };

    if (loading) return <div className="flex items-center justify-center h-64">Loading jobs...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Applications</h1>
                    <p className="text-slate-500 mt-1">Explore and apply for roles that match your profile.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search jobs or companies..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                <button
                    onClick={() => setFilter('open')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'open'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <div className={`w-2 h-2 rounded-full ${filter === 'open' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    Open
                    <span className={`px-2 py-0.5 rounded-full text-xs ${filter === 'open' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'
                        }`}>
                        {openJobsCount}
                    </span>
                </button>
                <button
                    onClick={() => setFilter('closed')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'closed'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <div className={`w-2 h-2 rounded-full ${filter === 'closed' ? 'bg-rose-500' : 'bg-slate-400'}`} />
                    Closed
                    <span className={`px-2 py-0.5 rounded-full text-xs ${filter === 'closed' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'
                        }`}>
                        {closedJobsCount}
                    </span>
                </button>
            </div>

            {/* Placement Status Info */}
            {student?.placeStatus !== 'unplaced' && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 border ${student.placeStatus === 'OpenDream' ? 'bg-purple-50 border-purple-100 text-purple-700' : 'bg-blue-50 border-blue-100 text-blue-700'
                    }`}>
                    <CheckCircle2 size={20} />
                    <p className="font-medium">
                        Current Status: <span className="font-bold uppercase">{student.placeStatus}</span>.
                        {student.placeStatus === 'OpenDream' ? ' You have reached the maximum placement limit.' : ' You can only apply for OpenDream roles now.'}
                    </p>
                </div>
            )}



            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 rounded-xl text-sm font-semibold text-slate-600">
                <div className="col-span-4">Job Role</div>
                <div className="col-span-2">Package</div>
                <div className="col-span-2">Deadline</div>
                <div className="col-span-2">Tier</div>
                <div className="col-span-2 text-right">Status</div>
            </div>

            {/* Job Rows */}
            <div className="space-y-3">
                {filteredJobs.map((job) => {
                    const hasApplied = applications.some(app => app.jobRole.id === job.id);
                    const { allowed, reason } = getApplicationStatus(job);
                    const isDeadlinePassed = new Date(job.applicationDeadline) < new Date();

                    return (
                        <Card
                            key={job.id}
                            className={`p-4 md:p-5 transition-all cursor-pointer group ${!allowed && !hasApplied
                                ? 'opacity-75 grayscale-[0.3]'
                                : 'hover:shadow-lg hover:border-indigo-200 hover:bg-indigo-50/30'
                                }`}
                            onClick={() => navigate(`/student/jobs/${job.id}`)}
                        >
                            {/* Mobile Layout */}
                            <div className="md:hidden space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                            <Briefcase size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{job.title}</h3>
                                            <p className="text-sm text-slate-500">{job.company.name}</p>
                                        </div>
                                    </div>
                                    <Badge variant={job.slab === 'OpenDream' ? 'success' : 'info'} className="shrink-0">
                                        {job.slab}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-4">
                                        <span className="text-slate-600">
                                            <span className="font-bold text-emerald-600">₹{(job.package || 0).toLocaleString()}</span> /yr
                                        </span>
                                        <span className="text-slate-500">
                                            Due: {new Date(job.applicationDeadline).toLocaleString()}
                                        </span>
                                    </div>
                                    {hasApplied ? (
                                        <Badge variant="success" className="text-xs">Applied</Badge>
                                    ) : isDeadlinePassed ? (
                                        <Badge variant="error" className="text-xs">Closed</Badge>
                                    ) : !allowed ? (
                                        <Badge variant="warning" className="text-xs">Not Eligible</Badge>
                                    ) : (
                                        <span className="text-indigo-600 font-medium text-xs">View Details →</span>
                                    )}
                                </div>
                            </div>

                            {/* Desktop Layout - Table Row */}
                            <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-4 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors shrink-0">
                                        <Briefcase size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                            {job.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 truncate">{job.company.name}</p>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <p className="font-bold text-emerald-600">₹{(job.package || 0).toLocaleString()}</p>
                                    <p className="text-xs text-slate-400">per annum</p>
                                </div>

                                <div className="col-span-2">
                                    <p className={`font-medium ${isDeadlinePassed ? 'text-rose-600' : 'text-slate-900'}`}>
                                        {new Date(job.applicationDeadline).toLocaleString()}
                                    </p>
                                    <p className={`text-xs ${isDeadlinePassed ? 'text-rose-400' : 'text-slate-400'}`}>
                                        {isDeadlinePassed ? 'Deadline passed' : 'Open'}
                                    </p>
                                </div>

                                <div className="col-span-2">
                                    <Badge variant={job.slab === 'OpenDream' ? 'success' : 'info'}>
                                        {job.slab}
                                    </Badge>
                                </div>

                                <div className="col-span-2 flex items-center justify-end gap-2">
                                    {hasApplied ? (
                                        <Badge variant="success" className="px-3 py-1">
                                            <CheckCircle2 size={14} className="mr-1" />
                                            Applied
                                        </Badge>
                                    ) : !allowed ? (
                                        <div className="text-right">
                                            <Badge variant="warning" className="px-3 py-1">Not Eligible</Badge>
                                            <p className="text-xs text-slate-400 mt-1 max-w-[150px] truncate" title={reason}>
                                                {reason}
                                            </p>
                                        </div>
                                    ) : isDeadlinePassed ? (
                                        <Badge variant="error" className="px-3 py-1">Closed</Badge>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="text-sm px-4 py-2 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/student/jobs/${job.id}`);
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {filteredJobs.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                        <Search size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                        {filter === 'open' ? 'No open jobs found' : 'No closed jobs found'}
                    </h3>
                    <p className="text-slate-500">
                        {filter === 'open'
                            ? 'Try adjusting your search or check back later.'
                            : 'All jobs with passed deadlines will appear here.'}
                    </p>
                </div>
            )}
        </div>
    );
};
