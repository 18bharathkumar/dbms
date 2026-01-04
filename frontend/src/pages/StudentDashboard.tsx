import React, { useEffect, useState } from 'react';
import { Card, Badge, Button } from '../components/UI';
import { Briefcase, TrendingUp, User, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
        name: string;
    };
}

interface Application {
    id: number;
    status: string;
    createdAt: string;
    jobRole: JobRole;
}

export const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState<Application[]>([]);
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, _setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const isProfileIncomplete = !student?.profile?.phoneNo || !student?.profile?.cgpa || !student?.profile?.resume;
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [appsRes, studentRes] = await Promise.all([
                api.get('/students/me/applications').catch(() => ({ data: [] })),
                api.get('/students/me/profile').catch(() => ({ data: null }))
            ]);
            setApplications(appsRes.data);
            setStudent(studentRes.data);
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
                    <p className="text-slate-500 mt-1">Track your applications and discover new opportunities.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => navigate('/statistics')}>
                        <TrendingUp size={18} />
                        Placement Stats
                    </Button>
                    <Button className="md:w-auto" onClick={() => navigate('/student/jobs')}>
                        View All Jobs
                    </Button>
                </div>
            </div>

            {/* Profile Completion Prompt */}
            {isProfileIncomplete && !loading && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200"
                >
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <User size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Complete Your Profile</h2>
                                <p className="text-indigo-100 mt-1">You need to provide your contact info, CGPA, and resume to start applying for jobs.</p>
                            </div>
                        </div>
                        <Button
                            className="bg-white text-indigo-600 hover:bg-indigo-50 border-none px-8"
                            onClick={() => navigate('/student/profile')}
                        >
                            Complete Now
                        </Button>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl" />
                </motion.div>
            )}

            {/* Placement Policy - Horizontal Section */}
            <Card className="p-8 border-l-4 border-l-indigo-500 bg-white shadow-sm overflow-hidden relative">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Briefcase size={22} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Placement Policy & Eligibility</h3>
                            <p className="text-sm text-slate-500">Understand your eligibility based on current placement status.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors group">
                            <div className="w-12 h-12 rounded-xl bg-white text-emerald-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">Dream Policy</p>
                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">If placed in a <span className="font-semibold text-emerald-600">Dream</span> role, you remain eligible only for higher-tier <span className="font-semibold text-indigo-600">OpenDream</span> opportunities.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-colors group">
                            <div className="w-12 h-12 rounded-xl bg-white text-purple-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">OpenDream Policy</p>
                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">Once placed in an <span className="font-semibold text-purple-600">OpenDream</span> role, you have reached the maximum limit and are ineligible for further applications.</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Subtle decorative background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
            </Card>

            {/* Message Display */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <p className="font-medium">{message.text}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recent Applications */}
            <div className="space-y-4 w-full mx-auto">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Recent Applications</h2>
                    <button
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        onClick={() => navigate('/student/applications')}
                    >
                        View All
                    </button>
                </div>

                {applications.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {[...applications]
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .slice(0, 6)
                            .map((app) => (
                                <Card
                                    key={app.id}
                                    className="p-4 hover:border-indigo-100 transition-colors group cursor-pointer hover:shadow-md"
                                    onClick={() => navigate(`/student/jobs/${app.jobRole.id}`)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                <Briefcase size={24} />
                                            </div>
                                            <div>
                                                <div className="flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:items-center sm:gap-2">
                                                    <span className="font-semibold text-slate-900">
                                                        {app.jobRole.title}
                                                    </span>

                                                    <span>{app.jobRole.company.name}</span>

                                                    <span className="hidden sm:inline">•</span>

                                                    <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant={app.status === 'ACCEPTED' ? 'success' : app.status === 'REJECTED' ? 'error' : 'info'}>
                                            {app.status}
                                        </Badge>
                                    </div>
                                </Card>
                            ))}
                    </div>
                ) : (
                    <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                            <Briefcase size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">No applications yet</p>
                        <p className="text-sm text-slate-400 mt-1">Start applying to see them here.</p>
                    </Card>
                )}
            </div>

        </div>
    );
};
