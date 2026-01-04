import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Button, Input, Card } from '../components/UI';
import { ArrowRight, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

interface Department {
    id: number;
    deptName: string;
}

export const RegisterPage: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        departmentId: '',
        outputYear: new Date().getFullYear() + 1,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await api.get('/departments');
                setDepartments(response.data);
            } catch (err) {
                console.error('Failed to fetch departments', err);
            }
        };
        fetchDepartments();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/students', {
                ...formData,
                departmentId: parseInt(formData.departmentId),
                outputYear: parseInt(formData.outputYear.toString()),
            });
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50" />

                    <div className="relative">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6 rotate-3">
                                <UserPlus className="text-white" size={32} />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Student Registration</h1>
                            <p className="text-slate-500 mt-2">Create your account to start applying</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Full Name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="name@university.edu"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />

                            <div className="flex flex-col gap-1.5 mb-4">
                                <label className="text-sm font-medium text-slate-700">Department</label>
                                <select
                                    className="input-field bg-slate-50/50"
                                    value={formData.departmentId}
                                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.deptName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Graduation Year"
                                type="number"
                                value={formData.outputYear}
                                onChange={(e) => setFormData({ ...formData, outputYear: parseInt(e.target.value) })}
                                required
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

                            <Button type="submit" className="w-full h-12 mt-4 group" isLoading={loading}>
                                Register Now
                                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                            <p className="text-sm text-slate-500">
                                Already have an account? <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign In</Link>
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};
