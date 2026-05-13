import { useState, useEffect } from 'react';
import { User, Lock, Shield, LogOut, Loader2, Monitor, Globe, Mail, Fingerprint, BadgeCheck, Activity } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

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
        <div className="space-y-12 pb-12">
            {/* Header */}
            <header className="max-w-3xl animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-brand-emerald/10 rounded-lg">
                        <Fingerprint className="text-brand-emerald" size={18} />
                    </div>
                    <span className="text-brand-emerald font-black text-xs uppercase tracking-widest">Account Management</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-brand-charcoal dark:text-white tracking-tight mb-4">
                    Workspace <span className="text-brand-emerald">Preferences</span>
                </h1>
                <p className="text-brand-muted font-medium text-lg leading-relaxed">
                    Orchestrate your professional identity and calibrate your security environment within the Layos ecosystem.
                </p>
            </header>

            <div className="bg-white dark:bg-brand-charcoal rounded-[40px] border border-brand-border shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {/* Navigation Tabs */}
                <div className="flex p-2 bg-brand-beige/50 dark:bg-white/5 border-b border-brand-border gap-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-brand-emerald text-brand-charcoal dark:text-white shadow-xl shadow-brand-charcoal/5 dark:shadow-brand-emerald/20' : 'text-brand-muted hover:bg-white/50'}`}
                    >
                        <User size={18} /> Professional Identity
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-white dark:bg-brand-emerald text-brand-charcoal dark:text-white shadow-xl shadow-brand-charcoal/5 dark:shadow-brand-emerald/20' : 'text-brand-muted hover:bg-white/50'}`}
                    >
                        <Shield size={18} /> Security Protocol
                    </button>
                </div>

                <div className="p-8 md:p-16">
                    {activeTab === 'profile' && (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            {/* Profile Header */}
                            <div className="flex flex-col md:flex-row items-center gap-10 pb-12 border-b border-brand-border">
                                <div className="relative group">
                                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[48px] bg-brand-charcoal dark:bg-brand-emerald flex items-center justify-center text-white text-4xl md:text-5xl font-black shadow-2xl shadow-brand-charcoal/20 transition-transform group-hover:scale-105 group-hover:rotate-3 duration-500">
                                        {firstName.charAt(0)}{lastName ? lastName.charAt(0) : ''}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-brand-charcoal">
                                        <BadgeCheck size={20} />
                                    </div>
                                </div>
                                <div className="text-center md:text-left space-y-4">
                                    <h2 className="text-3xl md:text-4xl font-black text-brand-charcoal dark:text-white tracking-tight">{user?.name}</h2>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                        <span className="px-4 py-1.5 bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                            Academic Rank: Student
                                        </span>
                                        <span className="px-4 py-1.5 bg-brand-beige dark:bg-white/5 text-brand-muted border border-brand-border rounded-xl text-[10px] font-black uppercase tracking-widest">
                                            ID: #{user?.id?.toString().padStart(6, '0')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSaveProfile} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-2">Given Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full h-16 px-6 bg-brand-beige/30 dark:bg-white/5 border-2 border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white transition-all text-brand-charcoal dark:text-white font-bold"
                                            value={firstName} 
                                            onChange={(e) => setFirstName(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-2">Family Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full h-16 px-6 bg-brand-beige/30 dark:bg-white/5 border-2 border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white transition-all text-brand-charcoal dark:text-white font-bold"
                                            value={lastName} 
                                            onChange={(e) => setLastName(e.target.value)} 
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-2">Digital Endpoint</label>
                                    <div className="relative">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                                        <input 
                                            type="email" 
                                            className="w-full h-16 pl-14 pr-6 bg-brand-beige/50 dark:bg-white/5 border-2 border-brand-border rounded-2xl text-brand-muted font-bold cursor-not-allowed"
                                            value={user?.email || ''} 
                                            disabled
                                        />
                                    </div>
                                    <p className="flex items-center gap-2 text-[10px] font-black text-brand-muted uppercase tracking-widest ml-2">
                                        <Lock size={12} className="text-brand-emerald" /> Synchronized with central directory
                                    </p>
                                </div>

                                <div className="flex justify-end pt-6">
                                    <button 
                                        type="submit" 
                                        disabled={isSavingProfile}
                                        className="h-16 px-12 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-charcoal/20 dark:shadow-brand-emerald/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 border-none cursor-pointer flex items-center gap-3"
                                    >
                                        {isSavingProfile ? <><Loader2 size={18} className="animate-spin" /> Synchronizing...</> : 'Commit Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            {/* Security Banner */}
                            <div className="bg-brand-charcoal dark:bg-white/5 rounded-[32px] p-8 flex items-center gap-8 text-white">
                                <div className="w-16 h-16 bg-brand-emerald/20 border border-brand-emerald/30 rounded-2xl flex items-center justify-center text-brand-emerald shrink-0">
                                    <Shield size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black uppercase tracking-tight">Access Guardian</h4>
                                    <p className="text-brand-beige/60 font-medium text-sm mt-1">Your cryptographic keys and active sessions are managed here.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveSecurity} className="space-y-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-2">Current Authentication Key</label>
                                    <input 
                                        type="password" 
                                        className="w-full h-16 px-6 bg-brand-beige/30 dark:bg-white/5 border-2 border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white transition-all text-brand-charcoal dark:text-white font-bold"
                                        value={currentPassword} 
                                        onChange={(e) => setCurrentPassword(e.target.value)} 
                                        required 
                                        placeholder="••••••••••••"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-2">New Security Token</label>
                                        <input 
                                            type="password" 
                                            className="w-full h-16 px-6 bg-brand-beige/30 dark:bg-white/5 border-2 border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white transition-all text-brand-charcoal dark:text-white font-bold"
                                            value={newPassword} 
                                            onChange={(e) => setNewPassword(e.target.value)} 
                                            required 
                                            minLength={8}
                                            placeholder="Min. 8 characters"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] ml-2">Confirm New Token</label>
                                        <input 
                                            type="password" 
                                            className="w-full h-16 px-6 bg-brand-beige/30 dark:bg-white/5 border-2 border-brand-border rounded-2xl focus:outline-none focus:border-brand-emerald focus:bg-white transition-all text-brand-charcoal dark:text-white font-bold"
                                            value={confirmPassword} 
                                            onChange={(e) => setConfirmPassword(e.target.value)} 
                                            required 
                                            minLength={8}
                                            placeholder="Verify identity"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6 border-b border-brand-border pb-12">
                                    <button 
                                        type="submit" 
                                        disabled={isSavingSecurity || (!currentPassword) || (newPassword !== confirmPassword)}
                                        className="h-16 px-12 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 border-none cursor-pointer flex items-center gap-3"
                                    >
                                        {isSavingSecurity ? <><Loader2 size={18} className="animate-spin" /> Rotational Update...</> : 'Rotate Credentials'}
                                    </button>
                                </div>

                                {/* Sessions Log */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3">
                                        <Activity size={18} className="text-brand-emerald" />
                                        <h4 className="text-lg font-black text-brand-charcoal dark:text-white uppercase tracking-tight">Active Transmissions</h4>
                                    </div>
                                    
                                    {isLoadingSessions ? (
                                        <div className="flex justify-center py-12">
                                            <Loader2 size={32} className="animate-spin text-brand-emerald" />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {sessions.map((session) => (
                                                <div key={session.id} className={`flex items-center justify-between p-6 bg-brand-beige/20 dark:bg-white/5 border-2 rounded-3xl transition-all ${session.is_current ? 'border-brand-emerald/30 bg-brand-emerald/5' : 'border-brand-border'}`}>
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${session.is_current ? 'bg-brand-emerald text-white shadow-lg shadow-brand-emerald/20' : 'bg-brand-beige dark:bg-white/10 text-brand-muted'}`}>
                                                            {session.name.includes('PC') || session.name.includes('Mac') || session.name.includes('Linux') ? <Monitor size={24} /> : <Globe size={24} />}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-black text-brand-charcoal dark:text-white uppercase tracking-tight flex items-center gap-3">
                                                                {session.name}
                                                                {session.is_current && <span className="text-[8px] bg-brand-emerald text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Active Connection</span>}
                                                            </div>
                                                            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
                                                                <Globe size={12} className="text-brand-emerald" /> 
                                                                {session.is_current ? 'Current Access Point • Real-time' : `Last sync: ${session.last_used_at}`} 
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {!session.is_current ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleTerminateSession(session.id)}
                                                            className="h-10 px-6 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border-none cursor-pointer hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                                        >
                                                            Sever Link
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={handleLogout}
                                                            className="h-10 px-6 bg-brand-charcoal dark:bg-white/10 text-brand-muted rounded-xl text-[10px] font-black uppercase tracking-widest border-none cursor-pointer hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center gap-2"
                                                        >
                                                            <LogOut size={14} /> Terminate
                                                        </button>
                                                    )}
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
