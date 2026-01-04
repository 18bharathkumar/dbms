import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Button, Input, Card } from '../components/UI';
import { GraduationCap, ShieldCheck, LayoutDashboard, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
    const [role, setRole] = useState<'student' | 'coordinator'>('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = role === 'student' ? '/auth/login/student' : '/auth/login/coordinator';
            const response = await api.post(endpoint, { email, password });
            login(response.data.token, response.data.user);
            navigate(role === 'student' ? '/student' : '/coordinator');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="relative overflow-hidden border-none shadow-2xl shadow-indigo-200/50">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50" />

                    <div className="relative">
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6 rotate-3">
                                <LayoutDashboard className="text-white" size={32} />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Placement Hub</h1>
                            <p className="text-slate-500 mt-2">Sign in to your account to continue</p>
                        </div>

                        <div className="flex p-1.5 mb-8 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200/50">
                            <button
                                onClick={() => setRole('student')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all duration-300 ${role === 'student'
                                    ? 'bg-white shadow-md text-indigo-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <GraduationCap size={20} />
                                Student
                            </button>
                            <button
                                onClick={() => setRole('coordinator')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all duration-300 ${role === 'coordinator'
                                    ? 'bg-white shadow-md text-indigo-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <ShieldCheck size={20} />
                                Coordinator
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-2">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="name@university.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-slate-50/50"
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-slate-50/50"
                            />

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-3 text-sm text-rose-600 bg-rose-50 rounded-lg border border-rose-100 flex items-center gap-2"
                                >
                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                                    {error}
                                </motion.div>
                            )}

                            <Button type="submit" className="w-full h-12 mt-6 group" isLoading={loading}>
                                Sign In
                                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-500">
                                {role === 'student' ? (
                                    <>Don't have an account? <Link to="/register" className="text-indigo-600 font-medium hover:underline">Register Now</Link></>
                                ) : (
                                    <>Authorized personnel only. <span className="text-indigo-600 font-medium cursor-pointer hover:underline">Need help?</span></>
                                )}
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};
