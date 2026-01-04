import React, { useEffect, useState } from 'react';
import { Card, Button } from '../components/UI';
import {
    User,
    Phone,
    GraduationCap,
    FileText,
    Camera,
    Save,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import api from '../api';
import { motion } from 'framer-motion';

interface ProfileData {
    name: string;
    phoneNo: string;
    address: string;
    cgpa: number;
    marks10: number;
    marks12: number;
    resume: string;
    photo: string;
}

export const StudentProfile: React.FC = () => {
    const [profile, setProfile] = useState<ProfileData>({
        name: '',
        phoneNo: '',
        address: '',
        cgpa: 0,
        marks10: 0,
        marks12: 0,
        resume: '',
        photo: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/students/me/profile');
            console.log(res.data);
            if (res.data) {
                setProfile({
                    name: res.data.name || '',
                    phoneNo: res.data.profile?.phoneNo || '',
                    address: res.data.profile?.address || '',
                    cgpa: res.data.profile?.cgpa || 0,
                    marks10: res.data.profile?.marks10 || 0,
                    marks12: res.data.profile?.marks12 || 0,
                    resume: res.data.profile?.resume || '',
                    photo: res.data.profile?.photo || ''
                });
            }
        } catch (err) {
            console.error('Failed to fetch profile', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await api.post('/students/me/profile', profile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
                    <p className="text-slate-500 mt-1">Keep your information up to date to apply for jobs.</p>
                </div>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}
                >
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="font-medium">{message.text}</p>
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Photo & Basic Info */}
                    <div className="space-y-6">
                        <Card className="p-6 flex flex-col items-center text-center">
                            <div className="relative group">
                                <div className="w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 overflow-hidden border-2 border-dashed border-slate-200 group-hover:border-indigo-400 transition-colors">
                                    {profile.photo ? (
                                        <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera size={40} />
                                    )}
                                </div>
                                <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors">
                                    <Camera size={16} />
                                </button>
                            </div>
                            <h3 className="mt-4 font-bold text-slate-900">{profile.name || 'Set Your Name'}</h3>
                            <p className="text-sm text-slate-500">Student</p>
                        </Card>

                        <Card className="p-6 space-y-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Phone size={18} className="text-indigo-600" />
                                Contact Details
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                                    <input
                                        type="text"
                                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={profile.phoneNo}
                                        onChange={(e) => setProfile({ ...profile, phoneNo: e.target.value })}
                                        placeholder="e.g. +91 9876543210"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</label>
                                    <textarea
                                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                                        rows={3}
                                        value={profile.address}
                                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                        placeholder="Your permanent address"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Academic & Professional */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="p-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <GraduationCap size={24} className="text-indigo-600" />
                                Academic Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                                    <div className="relative mt-1">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current CGPA</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={profile.cgpa}
                                        onChange={(e) => setProfile({ ...profile, cgpa: parseFloat(e.target.value) })}
                                        placeholder="e.g. 8.5"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">10th Marks (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={profile.marks10}
                                        onChange={(e) => setProfile({ ...profile, marks10: parseFloat(e.target.value) || 0 })}
                                        placeholder="e.g. 95.5"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">12th Marks (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={profile.marks12}
                                        onChange={(e) => setProfile({ ...profile, marks12: parseFloat(e.target.value) || 0 })}
                                        placeholder="e.g. 92.5"
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <FileText size={24} className="text-indigo-600" />
                                Professional Documents
                            </h3>
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resume Link (Google Drive/Dropbox)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={profile.resume}
                                        onChange={(e) => setProfile({ ...profile, resume: e.target.value })}
                                        placeholder="https://drive.google.com/..."
                                    />
                                    <Button type="button" variant="outline" size="sm">
                                        Upload File
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500 italic">Make sure the link is publicly accessible to recruiters.</p>
                            </div>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => fetchProfile()}>
                                Reset Changes
                            </Button>
                            <Button type="submit" className="gap-2" disabled={saving}>
                                {saving ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Profile
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
