import { useState, useEffect } from 'react';
import { User, Lock, Shield, LogOut, Loader2, Monitor, Globe, Mail, Fingerprint, BadgeCheck, Activity } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { SkeletonRow } from '../../../components/common/SkeletonLoader';

const Account = () => {
    const { user, logout, updateUserInfo } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    const nameParts = user?.name ? user.name.split(' ') : [''];
    const initialFirstName = nameParts[0] || '';
    const initialLastName = nameParts.slice(1).join(' ') || '';

    const [firstName, setFirstName] = useState(initialFirstName);
    const [lastName, setLastName] = useState(initialLastName);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSavingSecurity, setIsSavingSecurity] = useState(false);
    
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);



    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (activeTab === 'security') {
            fetchSessions();
        }
    }, [activeTab]);

    const fetchSessions = async () => {
        setIsLoadingSessions(true);
        try {
            const res = await fetch(`${API_URL}/active-sessions`, {
                headers: { 'Authorization': `Bearer ${token}` }
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
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Session terminated');
                fetchSessions();
            }
        } catch (err) {
            toast.error('Failed to terminate session');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            const res = await fetch(`${API_URL}/update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: `${firstName} ${lastName}`.trim(),
                    email: user?.email,
                })
            });
            const data = await res.json();
            if (res.ok) {
                updateUserInfo(data.user);
                toast.success('Profile updated successfully');
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (err) {
            toast.error('An error occurred');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSaveSecurity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        setIsSavingSecurity(true);
        try {
            const res = await fetch(`${API_URL}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    new_password_confirmation: confirmPassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Password updated successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(data.message || 'Failed to update password');
            }
        } catch (err) {
            toast.error('An error occurred');
        } finally {
            setIsSavingSecurity(false);
        }
    };

    return (
        <div className="space-y-8 md:space-y-12 pb-12 px-4 sm:px-6 max-w-6xl mx-auto">
            {/* Header */}
            <header className="max-w-3xl animate-fade-in-up mt-6 md:mt-12">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                    <div className="p-2 bg-brand-emerald/10 rounded-lg shrink-0">
                        <Fingerprint className="text-brand-emerald" size={18} />
                    </div>
                    <span className="text-brand-emerald font-black text-[10px] md:text-xs uppercase tracking-widest">Account Management</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white tracking-tight mb-3 md:mb-4">
                    Workspace <span className="text-brand-emerald">Preferences</span>
                </h1>
                <p className="text-brand-muted font-medium text-base md:text-lg leading-relaxed">
                    Orchestrate your professional identity and calibrate your security environment within the Layos ecosystem.
                </p>
            </header>

            <div className="bg-white dark:bg-brand-charcoal rounded-3xl md:rounded-xl border border-brand-border shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {/* Navigation Tabs */}
                <div className="flex p-1.5 sm:p-2 bg-brand-beige/50 dark:bg-white/5 border-b border-brand-border gap-1 sm:gap-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 py-3 sm:py-5 px-2 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-brand-emerald text-brand-charcoal dark:text-white shadow-xl shadow-brand-charcoal/5 dark:shadow-brand-emerald/20' : 'text-brand-muted hover:bg-white/50'}`}
                    >
                        <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="text-center">Professional Identity</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 py-3 sm:py-5 px-2 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-white dark:bg-brand-emerald text-brand-charcoal dark:text-white shadow-xl shadow-brand-charcoal/5 dark:shadow-brand-emerald/20' : 'text-brand-muted hover:bg-white/50'}`}
                    >
                        <Shield size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="text-center">Security Protocol</span>
                    </button>
                </div>

                <div className="p-4 sm:p-8 md:p-16">
                    {activeTab === 'profile' && (
                        <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500">
                            {/* Profile Header */}
                            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 pb-8 md:pb-12 border-b border-brand-border">
                                <div className="relative group shrink-0">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-[32px] md:rounded-[48px] bg-brand-charcoal dark:bg-brand-emerald flex items-center justify-center text-white text-3xl sm:text-4xl md:text-5xl font-black shadow-2xl shadow-brand-charcoal/20 transition-transform group-hover:scale-105 group-hover:rotate-3 duration-500">
                                        {firstName.charAt(0)}{lastName ? lastName.charAt(0) : ''}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-brand-charcoal">
                                        <BadgeCheck size={18} className="sm:w-5 sm:h-5" />
                                    </div>
                                </div>
                                <div className="text-center md:text-left space-y-3">
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-brand-charcoal dark:text-white tracking-tight">{user?.name}</h2>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                        <span className="px-3 py-1 bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                            Academic Rank: Student
                                        </span>
                                        <span className="px-3 py-1 bg-brand-beige dark:bg-white/5 text-brand-muted border border-brand-border rounded-lg text-[9px] font-black uppercase tracking-widest">
                                            ID: #{user?.id?.toString().padStart(6, '0')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSaveProfile} className="space-y-6 md:space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-1">Given Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full h-14 md:h-16 px-5 md:px-6 bg-brand-beige/30 dark:bg-white/5 border-2 border-brand-border rounded-xl md:rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white transition-all text-brand-charcoal dark:text-white font-bold"
                                            value={firstName} 
                                            onChange={(e) => setFirstName(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-1">Family Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full h-14 md:h-16 px-5 md:px-6 bg-brand-beige/30 dark:bg-white/5 border-2 border-brand-border rounded-xl md:rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white transition-all text-brand-charcoal dark:text-white font-bold"
                                            value={lastName} 
                                            onChange={(e) => setLastName(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                                        <input 
                                            type="email" 
                                            className="w-full h-14 md:h-16 pl-12 md:pl-14 pr-5 md:pr-6 bg-brand-beige/50 dark:bg-white/5 border-2 border-brand-border rounded-xl md:rounded-2xl text-brand-muted font-bold cursor-not-allowed text-sm md:text-base"
                                            value={user?.email || ''} 
                                            disabled
                                        />
                                    </div>
                                    <p className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">
                                        <Lock size={12} className="text-brand-emerald shrink-0" /> Contact administrator to modify email endpoint
                                    </p>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={isSavingProfile}
                                        className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-12 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 transition-all hover:scale-[1.02] sm:hover:scale-105 active:scale-95 disabled:opacity-50 border-none cursor-pointer flex items-center justify-center gap-3"
                                    >
                                        {isSavingProfile ? <><Loader2 size={18} className="animate-spin" /> Synchronizing...</> : 'Commit Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500">
                            {/* Security Banner */}
                            <div className="bg-brand-charcoal dark:bg-white/5 rounded-2xl p-5 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-8 text-white">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-emerald/20 border border-brand-emerald/30 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-emerald shrink-0">
                                    <Shield size={28} className="sm:w-8 sm:h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg sm:text-xl font-black uppercase tracking-tight">Access Guardian</h4>
                                    <p className="text-brand-beige/60 font-medium text-xs sm:text-sm">Your cryptographic keys and active sessions are managed here.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveSecurity} className="space-y-6 md:space-y-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-1">Current Authentication Key</label>
                                    <input 
                                        type="password" 
                                        className="w-full h-14 md:h-16 px-5 md:px-6 bg-brand-beige/30 dark:bg-white/5 border-2 border-brand-border rounded-xl md:rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white transition-all text-brand-charcoal dark:text-white font-bold"
                                        value={currentPassword} 
                                        onChange={(e) => setCurrentPassword(e.target.value)} 
                                        required 
                                        placeholder="••••••••••••"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-1">New Security Key</label>
                                        <input 
                                            type="password" 
                                            className="w-full h-14 md:h-16 px-5 md:px-6 bg-brand-beige/30 dark:bg-white/5 border-2 border-brand-border rounded-xl md:rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white transition-all text-brand-charcoal dark:text-white font-bold"
                                            value={newPassword} 
                                            onChange={(e) => setNewPassword(e.target.value)} 
                                            required 
                                            minLength={8}
                                            placeholder="Min. 8 characters"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-1">Confirm New Key</label>
                                        <input 
                                            type="password" 
                                            className="w-full h-14 md:h-16 px-5 md:px-6 bg-brand-beige/30 dark:bg-white/5 border-2 border-brand-border rounded-xl md:rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white transition-all text-brand-charcoal dark:text-white font-bold"
                                            value={confirmPassword} 
                                            onChange={(e) => setConfirmPassword(e.target.value)} 
                                            required 
                                            minLength={8}
                                            placeholder="Verify identity"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-b border-brand-border pb-8 md:pb-12">
                                    <button 
                                        type="submit" 
                                        disabled={isSavingSecurity || (!currentPassword) || (newPassword !== confirmPassword)}
                                        className="w-full sm:w-auto h-14 md:h-16 px-8 md:px-12 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] sm:hover:scale-105 active:scale-95 disabled:opacity-50 border-none cursor-pointer flex items-center justify-center gap-3"
                                    >
                                        {isSavingSecurity ? <><Loader2 size={18} className="animate-spin" /> Updating Security Key...</> : 'Update Security Key'}
                                    </button>
                                </div>

                                {/* Sessions Log */}
                                <div className="space-y-6 md:space-y-8">
                                    <div className="flex items-center gap-3">
                                        <Activity size={18} className="text-brand-emerald shrink-0" />
                                        <h4 className="text-base sm:text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Active Transmissions</h4>
                                    </div>
                                    
                                    {isLoadingSessions ? (
                                     <SkeletonRow/>
                                    ) : (
                                        <div className="space-y-4">
                                            {sessions.map((session) => (
                                                <div key={session.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-brand-beige/20 dark:bg-white/5 border-2 rounded-2xl sm:rounded-3xl transition-all gap-4 ${session.is_current ? 'border-brand-charcoal/30 bg-brand-charcoal/5' : 'border-brand-border'}`}>
                                                    <div className="flex items-start gap-4 sm:gap-6 min-w-0">
                                                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${session.is_current ? 'bg-brand-emerald text-white shadow-sm shadow-brand-charcoal/' : 'bg-brand-beige dark:bg-white/10 text-brand-muted'}`}>
                                                            {session.name.includes('PC') || session.name.includes('Mac') || session.name.includes('Linux') ? <Monitor size={22} className="sm:w-6 sm:h-6" /> : <Globe size={22} className="sm:w-6 sm:h-6" />}
                                                        </div>
                                                        <div className="space-y-1 min-w-0 flex-1">
                                                            <div className="text-xs sm:text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-tight flex flex-wrap items-center gap-2">
                                                                <span className="truncate max-w-[180px] sm:max-w-none">{session.name}</span>
                                                                {session.is_current && <span className="text-[8px] bg-brand-emerald text-white px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0">Active Connection</span>}
                                                            </div>
                                                            <p className="text-[9px] sm:text-[10px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-1.5 flex-wrap">
                                                                <Globe size={11} className="text-brand-emerald shrink-0" /> 
                                                                <span>{session.is_current ? 'Current Access Point • Real-time' : `Last sync: ${session.last_used_at}`}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="w-full sm:w-auto shrink-0 flex justify-end">
                                                        {!session.is_current ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleTerminateSession(session.id)}
                                                                className="w-full sm:w-auto h-10 px-5 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border-none cursor-pointer hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                                            >
                                                                Sever Link
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={handleLogout}
                                                                className="w-full sm:w-auto h-10 px-5 bg-brand-charcoal dark:bg-white/10 text-brand-muted rounded-xl text-[10px] font-black uppercase tracking-widest border-none cursor-pointer hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                                                            >
                                                                <LogOut size={12} /> Terminate
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Account;