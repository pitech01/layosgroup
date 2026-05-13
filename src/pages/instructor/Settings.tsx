import { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Lock,
    Shield,
    Camera,
    LogOut,
    Loader2,
    AlertCircle,
    CheckCircle,
    Monitor,
    Globe,
    Sparkles,
    Fingerprint,
    Smartphone,
    UserCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Settings = () => {
    const { user, logout, updateUserInfo } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name,
                email: user.email,
                bio: user.bio || ''
            }));
        }
        if (activeTab === 'security') {
            fetchSessions();
        }
    }, [user, activeTab]);

    const fetchSessions = async () => {
        setIsLoadingSessions(true);
        try {
            const res = await fetch(`${API_URL}/active-sessions`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (res.ok) {
                setSessions(data);
            }
        } catch (err) {
            console.error('Failed to fetch sessions', err);
        } finally {
            setIsLoadingSessions(false);
        }
    };

    const handleTerminateSession = async (sessionId: number) => {
        try {
            const res = await fetch(`${API_URL}/active-sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                toast.success('Session terminated');
                fetchSessions();
            }
        } catch (err) {
            toast.error('Failed to terminate session');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
        setSuccess(null);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`${API_URL}/update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    bio: formData.bio
                })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Identity profile updated');
                if (updateUserInfo) updateUserInfo(data.user);
            } else {
                throw new Error(data.message || 'Profile update failed.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`${API_URL}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    current_password: formData.currentPassword,
                    new_password: formData.newPassword,
                    new_password_confirmation: formData.confirmPassword
                })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Security protocols updated');
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
            } else {
                throw new Error(data.message || 'Password update failed.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/instructor-login');
    };

    return (
        <div className="space-y-12 pb-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-fade-in-up">
                <div className="max-w-2xl space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-emerald/10 rounded-lg">
                            <Fingerprint className="text-brand-emerald" size={18} />
                        </div>
                        <span className="text-brand-emerald font-black text-xs uppercase tracking-widest">Administrative Control</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white tracking-tight">
                        Account <span className="text-brand-emerald">Protocols</span>
                    </h1>
                    <p className="text-brand-muted font-medium text-lg leading-relaxed">
                        Configure your professional identity, manage security credentials, and monitor active administrative sessions.
                    </p>
                </div>
            </header>

            {/* Content Container */}
            <div className="bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border overflow-hidden shadow-2xl shadow-brand-charcoal/5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {/* Tabs Navigation */}
                <nav className="flex px-6 md:px-10 pt-8 gap-2 border-b border-brand-border bg-brand-beige/20 dark:bg-white/5 backdrop-blur-xl shrink-0 overflow-x-auto custom-scrollbar">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-3 px-8 py-5 rounded-t-3xl font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer ${
                            activeTab === 'profile' 
                            ? 'bg-white dark:bg-brand-charcoal text-brand-emerald border-t border-x border-brand-border' 
                            : 'text-brand-muted hover:text-brand-charcoal dark:hover:text-white'
                        }`}
                    >
                        <UserCircle size={18} /> Identity Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-3 px-8 py-5 rounded-t-3xl font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer ${
                            activeTab === 'security' 
                            ? 'bg-white dark:bg-brand-charcoal text-brand-emerald border-t border-x border-brand-border' 
                            : 'text-brand-muted hover:text-brand-charcoal dark:hover:text-white'
                        }`}
                    >
                        <Shield size={18} /> Security Guard
                    </button>
                </nav>

                <div className="p-8 md:p-16">
                    {activeTab === 'profile' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 animate-fade-in-up">
                            {/* Avatar Section */}
                            <div className="lg:col-span-4 flex flex-col items-center gap-8">
                                <div className="relative group">
                                    <div className="w-48 h-48 rounded-[56px] bg-brand-beige dark:bg-white/5 flex items-center justify-center text-5xl font-black text-brand-emerald border-4 border-white dark:border-brand-charcoal shadow-2xl shadow-brand-charcoal/10 group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                                        {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'UI'}
                                    </div>
                                    <button className="absolute -bottom-4 -right-4 w-14 h-14 bg-brand-emerald text-white rounded-2xl flex items-center justify-center border-4 border-white dark:border-brand-charcoal shadow-lg hover:scale-110 active:scale-95 transition-all border-none cursor-pointer">
                                        <Camera size={24} />
                                    </button>
                                </div>
                                <div className="text-center space-y-2">
                                    <h4 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">{user?.name}</h4>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-emerald/10 text-brand-emerald rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-emerald/20">
                                        <Sparkles size={12} /> Faculty Member
                                    </div>
                                </div>
                            </div>

                            {/* Form Section */}
                            <div className="lg:col-span-8 space-y-10">
                                {error && (
                                    <div className="flex items-center gap-4 p-6 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-3xl text-red-600 dark:text-red-400 font-bold text-sm">
                                        <AlertCircle size={20} /> {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Full Identity Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors">
                                                <User size={20} />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                className="w-full h-14 pl-14 pr-6 bg-brand-beige/30 dark:bg-white/5 border border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal/50 transition-all text-brand-charcoal dark:text-white font-bold"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Communication Endpoint</label>
                                        <div className="relative group">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors">
                                                <Mail size={20} />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                className="w-full h-14 pl-14 pr-6 bg-brand-beige/30 dark:bg-white/5 border border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal/50 transition-all text-brand-charcoal dark:text-white font-bold"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Professional Narrative</label>
                                    <textarea
                                        name="bio"
                                        className="w-full p-6 bg-brand-beige/30 dark:bg-white/5 border border-brand-border rounded-3xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal/50 transition-all text-brand-charcoal dark:text-white font-bold min-h-[160px] resize-none"
                                        placeholder="Articulate your educational philosophy and professional journey..."
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <div className="pt-6 border-t border-brand-border flex justify-end">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="h-14 px-10 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all border-none cursor-pointer"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : null}
                                        {isSaving ? 'Synchronizing...' : 'Save Profile Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="max-w-4xl mx-auto space-y-16 animate-fade-in-up">
                            {/* Security Status */}
                            <div className="flex items-center gap-8 p-10 bg-emerald-500/10 border border-emerald-500/20 rounded-[40px] group">
                                <div className="w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                                    <Shield size={40} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">Encryption Active</h4>
                                    <p className="text-emerald-600/70 font-medium text-sm">Your administrative terminal is currently protected by industry-standard security protocols.</p>
                                </div>
                            </div>

                            {/* Password Form */}
                            <div className="space-y-10">
                                <h3 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Access Credentials</h3>
                                {error && (
                                    <div className="flex items-center gap-4 p-6 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-3xl text-red-600 dark:text-red-400 font-bold text-sm">
                                        <AlertCircle size={20} /> {error}
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-3 max-w-md">
                                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Current Security Key</label>
                                        <div className="relative group">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors">
                                                <Lock size={20} />
                                            </div>
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                className="w-full h-14 pl-14 pr-6 bg-brand-beige/30 dark:bg-white/5 border border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal/50 transition-all text-brand-charcoal dark:text-white font-bold"
                                                placeholder="••••••••••••"
                                                value={formData.currentPassword}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-brand-border">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">New Security Key</label>
                                            <div className="relative group">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors">
                                                    <Lock size={20} />
                                                </div>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    className="w-full h-14 pl-14 pr-6 bg-brand-beige/30 dark:bg-white/5 border border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal/50 transition-all text-brand-charcoal dark:text-white font-bold"
                                                    placeholder="Minimum 8 characters"
                                                    value={formData.newPassword}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Verify New Key</label>
                                            <div className="relative group">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-emerald transition-colors">
                                                    <Lock size={20} />
                                                </div>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    className="w-full h-14 pl-14 pr-6 bg-brand-beige/30 dark:bg-white/5 border border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal/50 transition-all text-brand-charcoal dark:text-white font-bold"
                                                    placeholder="Re-enter for verification"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleUpdatePassword}
                                        disabled={isSaving}
                                        className="h-14 px-10 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all border-none cursor-pointer"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : null}
                                        {isSaving ? 'Updating...' : 'Update Credentials'}
                                    </button>
                                </div>
                            </div>

                            {/* Session Management */}
                            <div className="space-y-10 pt-16 border-t border-brand-border">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Active Transmissions</h3>
                                        <p className="text-brand-muted font-medium text-sm leading-relaxed">Manage devices currently synchronized with your administrative profile.</p>
                                    </div>
                                </div>

                                {isLoadingSessions ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-4 bg-brand-beige/20 dark:bg-white/5 rounded-[40px] border border-brand-border border-dashed">
                                        <Loader2 size={32} className="animate-spin text-brand-emerald" />
                                        <p className="font-black text-[10px] text-brand-muted uppercase tracking-widest">Scanning Network Sessions...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {sessions.map((session) => (
                                            <div key={session.id} className={`flex flex-col md:flex-row items-center justify-between p-8 rounded-[32px] border transition-all ${session.is_current ? 'bg-white dark:bg-brand-charcoal border-brand-emerald shadow-lg shadow-brand-emerald/5' : 'bg-brand-beige/10 dark:bg-white/5 border-brand-border opacity-70'}`}>
                                                <div className="flex items-center gap-6 mb-6 md:mb-0">
                                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${session.is_current ? 'bg-brand-emerald text-white' : 'bg-brand-beige dark:bg-white/10 text-brand-muted'} shadow-inner`}>
                                                        {session.device_type === 'mobile' ? <Smartphone size={32} /> : <Monitor size={32} />}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <h5 className="text-base font-black text-brand-charcoal dark:text-white uppercase tracking-tight">{session.name || 'Administrative Terminal'}</h5>
                                                            {session.is_current && (
                                                                <span className="px-2 py-0.5 bg-brand-emerald/10 text-brand-emerald rounded text-[8px] font-black uppercase tracking-widest border border-brand-emerald/20">Current Path</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                                                            <Globe size={12} /> {session.ip_address || 'Unspecified Endpoint'} • {session.is_current ? 'Active Synchronization' : `Last signal: ${session.last_used_at}`} 
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {!session.is_current ? (
                                                    <button 
                                                        onClick={() => handleTerminateSession(session.id)}
                                                        className="h-11 px-6 bg-red-500/10 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
                                                    >
                                                        Terminate Connection
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={handleLogout}
                                                        className="h-11 px-6 bg-brand-charcoal dark:bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2 border-none cursor-pointer"
                                                    >
                                                        <LogOut size={16} /> Close Terminal
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
