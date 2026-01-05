import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '../components/UI';
import {
    Briefcase,
    Calendar,
    DollarSign,
    CheckCircle2,
    AlertCircle,
    Building2,
    TrendingUp,
    Clock,
    ArrowLeft,
    GraduationCap
} from 'lucide-react';
import api from '../api';
import { motion } from 'framer-motion';

interface JobRole {
    id: number;
    title: string;
    package: number;
    packageDetails: string;
    cgpaCutoff: number;
    slab: string;
    applicationDeadline: string;
    currentStage: string;
    oaDate?: string;
    interviewDate?: string;
    company: {
        id: number;
        name: string;
    };
}

interface Application {
    id: number;
    status: string;
    createdAt: string;
}

export const JobRoleDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [jobRole, setJobRole] = useState<JobRole | null>(null);
    const [application, setApplication] = useState<Application | null>(null);
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [jobRes, appsRes, studentRes] = await Promise.all([
                api.get(`/companies/job-roles/${id}`).catch(() => ({ data: null })),
                api.get('/students/me/applications').catch(() => ({ data: [] })),
                api.get('/students/me/profile').catch(() => ({ data: null }))
            ]);
            setJobRole(jobRes.data);
            setStudent(studentRes.data);

            // Check if already applied to this job
            const existingApp = appsRes.data.find((app: any) => app.jobRole?.id === Number(id));
            setApplication(existingApp || null);
        } catch (err) {
            console.error('Failed to fetch job details', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!student?.profile?.phoneNo || !student?.profile?.cgpa || !student?.profile?.resume) {
            setMessage({
                type: 'error',
                text: 'Please complete your profile (Phone, CGPA, and Resume) before applying.'
            });
            setTimeout(() => navigate('/student/profile'), 2000);
            return;
        }

        setApplying(true);
        setMessage(null);
        try {
            await api.post('/students/applications', { jobRoleId: Number(id) });
            setMessage({ type: 'success', text: 'Application submitted successfully!' });
            fetchData();
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.response?.data?.error || 'Failed to submit application'
            });
        } finally {
            setApplying(false);
        }
    };

    const getEligibilityStatus = () => {
        if (!jobRole || !student) return { allowed: true };

        const studentStatus = student?.placeStatus;
        const jobSlab = jobRole.slab;

        if (studentStatus === 'OpenDream') {
            return { allowed: false, reason: 'You are already placed in an OpenDream role.' };
        }
        if (studentStatus === 'Dream' && jobSlab !== 'OpenDream') {
            return { allowed: false, reason: 'You are placed in a Dream role. You can only apply for OpenDream roles.' };
        }
        return { allowed: true };
    };

    const isDeadlinePassed = jobRole ? new Date(jobRole.applicationDeadline) < new Date() : false;
    const { allowed, reason } = getEligibilityStatus();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!jobRole) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-slate-900">Job not found</h2>
                <p className="text-slate-500 mt-2">The job role you're looking for doesn't exist.</p>
                <Button className="mt-4" onClick={() => navigate('/student/jobs')}>
                    Back to Applications
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => navigate('/student/jobs')}
                className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors font-medium"
            >
                <ArrowLeft size={20} />
                Back to Applications
            </button>

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden"
            >
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <Briefcase size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{jobRole.title}</h1>
                                <div className="flex items-center gap-2 mt-2 text-white/90">
                                    <Building2 size={18} />
                                    <span className="text-lg">{jobRole.company.name}</span>
                                </div>
                            </div>
                        </div>
                        <Badge
                            variant={jobRole.slab === 'OpenDream' ? 'success' : 'info'}
                            className="text-base px-4 py-2"
                        >
                            {jobRole.slab}
                        </Badge>
                    </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl" />
            </motion.div>

            {/* Message Display */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}
                >
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="font-medium">{message.text}</p>
                </motion.div>
            )}

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-5 text-center hover:shadow-lg transition-shadow">
                    <DollarSign size={24} className="text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Package</p>
                    <p className="text-xl font-bold text-slate-900">₹{(jobRole.package || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-400">per annum</p>
                </Card>

                <Card className="p-5 text-center hover:shadow-lg transition-shadow">
                    <GraduationCap size={24} className="text-purple-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">CGPA Cutoff</p>
                    <p className="text-xl font-bold text-slate-900">{jobRole.cgpaCutoff || 'N/A'}</p>
                    <p className="text-xs text-slate-400">minimum</p>
                </Card>

                <Card className="p-5 text-center hover:shadow-lg transition-shadow">
                    <TrendingUp size={24} className="text-indigo-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Job Tier</p>
                    <p className="text-xl font-bold text-slate-900">{jobRole.slab}</p>
                    <p className="text-xs text-slate-400">category</p>
                </Card>

                <Card className="p-5 text-center hover:shadow-lg transition-shadow">
                    <Calendar size={24} className="text-amber-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Deadline</p>
                    <p className="text-lg font-bold text-slate-900">
                        {new Date(jobRole.applicationDeadline).toLocaleString()}
                    </p>
                    <p className={`text-xs ${isDeadlinePassed ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {isDeadlinePassed ? 'Closed' : 'Open'}
                    </p>
                </Card>
            </div>

            {/* Package Details */}
            {jobRole.packageDetails && (
                <Card className="p-6">
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                        <DollarSign size={20} className="text-emerald-600" />
                        Package Breakdown
                    </h3>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {jobRole.packageDetails}
                    </p>
                </Card>
            )}

            {/* Recruitment Timeline */}
            <Card className="p-6">
                <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
                    <Clock size={20} className="text-indigo-600" />
                    Recruitment Timeline
                </h3>
                <div className="relative">
                    <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-200" />
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 relative">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${jobRole.currentStage === 'APPLICATION_OPEN' ? 'bg-indigo-500' : 'bg-slate-200'
                                }`}>
                                <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                            <div className="flex-1 pb-2">
                                <p className="font-semibold text-slate-900">Application Phase</p>
                                <p className="text-sm text-slate-500">Submit your application before the deadline</p>
                            </div>
                        </div>

                        {jobRole.oaDate && (
                            <div className="flex items-start gap-4 relative">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${jobRole.currentStage === 'OA_SHORTLIST_DONE' ? 'bg-indigo-500' : 'bg-slate-200'
                                    }`}>
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                                <div className="flex-1 pb-2">
                                    <p className="font-semibold text-slate-900">Online Assessment</p>
                                    <p className="text-sm text-slate-500">
                                        {new Date(jobRole.oaDate).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {jobRole.interviewDate && (
                            <div className="flex items-start gap-4 relative">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${jobRole.currentStage === 'INTERVIEW_SHORTLIST_DONE' ? 'bg-indigo-500' : 'bg-slate-200'
                                    }`}>
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                                <div className="flex-1 pb-2">
                                    <p className="font-semibold text-slate-900">Interview Round</p>
                                    <p className="text-sm text-slate-500">
                                        {new Date(jobRole.interviewDate).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-4 relative">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${jobRole.currentStage === 'FINAL_RESULT_ANNOUNCED' ? 'bg-emerald-500' : 'bg-slate-200'
                                }`}>
                                <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-900">Final Results</p>
                                <p className="text-sm text-slate-500">Placement offers announced</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Application Status / Apply Section */}
            <Card className="p-6">
                {application ? (
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Your Application</h3>
                            <p className="text-slate-500 text-sm mt-1">
                                Applied on {new Date(application.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <Badge
                            variant={
                                application.status === 'ACCEPTED'
                                    ? 'success'
                                    : application.status === 'REJECTED'
                                        ? 'error'
                                        : 'info'
                            }
                            className="text-base px-4 py-2"
                        >
                            {application.status}
                        </Badge>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {!allowed && (
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                                <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-amber-700">{reason}</p>
                            </div>
                        )}

                        {isDeadlinePassed && (
                            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-3">
                                <AlertCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-rose-700">The application deadline has passed.</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Ready to Apply?</h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    Submit your application to be considered for this role.
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                className="px-8"
                                onClick={handleApply}
                                disabled={applying || !allowed || isDeadlinePassed}
                            >
                                {applying ? 'Applying...' : 'Apply Now'}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};
