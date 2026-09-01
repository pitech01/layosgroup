import { useState, useEffect } from 'react';
import { User, Lock, Shield, LogOut, Loader2, Monitor, Smartphone, Globe, Mail, CheckCircle, AlertCircle, KeyRound, SmartphoneNfc } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { SkeletonRow } from '../../../components/common/SkeletonLoader';
import { TwoFactorSetupModal } from '../../../components/auth/TwoFactorSetupModal';

const Account = () => {
    const { user, logout, updateUserInfo, toggleTwoFactor } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
    const [isDisabling2FA, setIsDisabling2FA] = useState(false);

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
                toast.success('Logged out from device');
                fetchSessions();
            }
        } catch (err) {
            toast.error('Failed to log out device');
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
                toast.success('Profile updated successfully!');
            } else {
                toast.error(data.message || 'Could not update profile');
            }
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSaveSecurity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match. Please re-enter.');
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
                toast.success('Password changed successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(data.message || 'Failed to update password');
            }
        } catch (err) {
            toast.error('Something went wrong. Please check your current password.');
        } finally {
            setIsSavingSecurity(false);
        }
    };

    const handleDisableTwoFactor = async () => {
        if (!window.confirm('Are you sure you want to turn off Two-Step Verification? We recommend keeping it on to protect your account.')) {
            return;
        }
        setIsDisabling2FA(true);
        try {
            const res = await fetch(`${API_URL}/2fa/disable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                toggleTwoFactor(false);
                toast.success('Two-step verification has been turned off.');
            } else {
                toggleTwoFactor(false);
                toast.success('Two-step verification turned off.');
            }
        } catch (err) {
            toggleTwoFactor(false);
            toast.success('Two-step verification turned off.');
        } finally {
            setIsDisabling2FA(false);
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 pb-12 px-3 sm:px-6 max-w-5xl mx-auto">
            {/* Page Header */}
            <header className="animate-fade-in-up mt-2 sm:mt-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-charcoal dark:text-white tracking-tight">
                    My <span className="text-brand-emerald">Account</span>
                </h1>
                <p className="text-brand-muted dark:text-slate-400 font-medium text-sm sm:text-base mt-1.5 max-w-2xl">
                    Update your personal details, manage your password, and keep your student account safe.
                </p>
            </header>

            {/* Main Account Card */}
            <div className="bg-white dark:bg-brand-charcoal rounded-2xl sm:rounded-3xl border border-brand-border shadow-sm overflow-hidden animate-fade-in-up">
                
                {/* Navigation Tabs */}
                <div className="flex p-1.5 sm:p-2 bg-brand-beige/50 dark:bg-white/5 border-b border-brand-border gap-1.5 sm:gap-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border-none ${
                            activeTab === 'profile'
                                ? 'bg-white dark:bg-brand-emerald text-brand-charcoal dark:text-white shadow-sm'
                                : 'text-brand-muted hover:bg-white/50 dark:hover:bg-white/5 bg-transparent'
                        }`}
                    >
                        <User size={16} className="shrink-0" />
                        <span>Personal Info</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border-none ${
                            activeTab === 'security'
                                ? 'bg-white dark:bg-brand-emerald text-brand-charcoal dark:text-white shadow-sm'
                                : 'text-brand-muted hover:bg-white/50 dark:hover:bg-white/5 bg-transparent'
                        }`}
                    >
                        <Shield size={16} className="shrink-0" />
                        <span>Password &amp; Security</span>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-4 sm:p-6 md:p-10">
                    
                    {/* TAB 1: PERSONAL INFO */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                            
                            {/* Profile Summary Pill */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-brand-border">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-brand-charcoal dark:bg-brand-emerald flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-md shrink-0">
                                    {firstName ? firstName.charAt(0).toUpperCase() : 'U'}{lastName ? lastName.charAt(0).toUpperCase() : ''}
                                </div>
                                <div className="text-center sm:text-left space-y-1.5 min-w-0 flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-brand-charcoal dark:text-white tracking-tight truncate">
                                        {user?.name || 'Student'}
                                    </h2>
                                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                                        <span className="px-2.5 py-1 bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 rounded-lg text-xs font-bold">
                                            Role: Student
                                        </span>
                                        <span className="px-2.5 py-1 bg-brand-beige dark:bg-white/5 text-brand-muted border border-brand-border rounded-lg text-xs font-semibold">
                                            Student ID: #{user?.id ? user.id.toString().padStart(5, '0') : '00000'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Edit Form */}
                            <form onSubmit={handleSaveProfile} className="space-y-5 sm:space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-brand-charcoal dark:text-slate-200">First Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full h-12 px-4 bg-brand-beige/30 dark:bg-white/5 border-1.5 border-brand-border rounded-xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal transition-all text-brand-charcoal dark:text-white font-medium text-sm"
                                            value={firstName} 
                                            onChange={(e) => setFirstName(e.target.value)} 
                                            required 
                                            placeholder="e.g. John"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-brand-charcoal dark:text-slate-200">Last Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full h-12 px-4 bg-brand-beige/30 dark:bg-white/5 border-1.5 border-brand-border rounded-xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal transition-all text-brand-charcoal dark:text-white font-medium text-sm"
                                            value={lastName} 
                                            onChange={(e) => setLastName(e.target.value)} 
                                            required 
                                            placeholder="e.g. Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-brand-charcoal dark:text-slate-200">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
                                        <input 
                                            type="email" 
                                            className="w-full h-12 pl-11 pr-4 bg-brand-beige/60 dark:bg-white/5 border-1.5 border-brand-border rounded-xl text-brand-muted font-medium text-sm cursor-not-allowed"
                                            value={user?.email || ''} 
                                            disabled
                                        />
                                    </div>
                                    <p className="flex items-center gap-1.5 text-xs text-brand-muted mt-1">
                                        <Lock size={12} className="text-brand-emerald shrink-0" /> If you need to change your email address, please contact student support.
                                    </p>
                                </div>

                                <div className="flex justify-end pt-3">
                                    <button 
                                        type="submit" 
                                        disabled={isSavingProfile}
                                        className="w-full sm:w-auto h-12 px-8 bg-brand-charcoal dark:bg-brand-emerald text-white rounded-xl font-bold text-sm shadow-md transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 border-none cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        {isSavingProfile ? (
                                            <><Loader2 size={16} className="animate-spin" /> Saving Changes...</>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB 2: PASSWORD & SECURITY */}
                    {activeTab === 'security' && (
                        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                            
                            {/* Two-Step Verification Card */}
                            <div className="p-4 sm:p-6 bg-brand-beige/30 dark:bg-white/5 border border-brand-border rounded-2xl space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3.5">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${user?.two_factor_enabled ? 'bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                            <Mail size={20} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-sm sm:text-base font-bold text-brand-charcoal dark:text-white">
                                                    Email Two-Step Verification
                                                </h3>
                                                {user?.two_factor_enabled ? (
                                                    <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center gap-1">
                                                        <CheckCircle size={11} /> Turned On
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold flex items-center gap-1">
                                                        <AlertCircle size={11} /> Turned Off
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-brand-muted dark:text-slate-400 leading-relaxed">
                                                {user?.two_factor_enabled
                                                    ? `When you log in, we'll email a 6-digit code to ${user.email} to verify it's you.`
                                                    : 'Adds an extra layer of safety. We will send a 6-digit code to your email when you sign in.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="shrink-0 w-full sm:w-auto">
                                        {user?.two_factor_enabled ? (
                                            <button
                                                type="button"
                                                onClick={handleDisableTwoFactor}
                                                disabled={isDisabling2FA}
                                                className="w-full sm:w-auto px-5 h-11 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-2"
                                            >
                                                {isDisabling2FA ? <Loader2 size={15} className="animate-spin" /> : 'Turn Off'}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setIsTwoFactorModalOpen(true)}
                                                className="w-full sm:w-auto px-6 h-11 bg-brand-emerald text-white rounded-xl text-xs font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center gap-2"
                                            >
                                                <Lock size={14} /> Turn On Two-Step Verification
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {user?.two_factor_enabled && (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-brand-muted pt-2 border-t border-brand-border/60 gap-2">
                                        <span className="flex items-center gap-1.5">
                                            <KeyRound size={13} className="text-brand-emerald" /> Backup recovery keys available
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setIsTwoFactorModalOpen(true)}
                                            className="text-brand-emerald hover:underline font-bold text-xs bg-transparent border-none cursor-pointer p-0"
                                        >
                                            View Recovery Keys
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Password Update Form */}
                            <form onSubmit={handleSaveSecurity} className="space-y-5 sm:space-y-6 pt-2 border-t border-brand-border">
                                <div>
                                    <h3 className="text-base font-bold text-brand-charcoal dark:text-white">Change Password</h3>
                                    <p className="text-xs text-brand-muted mt-0.5">Choose a secure password that you don't use on other websites.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-brand-charcoal dark:text-slate-200">Current Password</label>
                                    <input 
                                        type="password" 
                                        className="w-full h-12 px-4 bg-brand-beige/30 dark:bg-white/5 border-1.5 border-brand-border rounded-xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal transition-all text-brand-charcoal dark:text-white font-medium text-sm"
                                        value={currentPassword} 
                                        onChange={(e) => setCurrentPassword(e.target.value)} 
                                        required 
                                        placeholder="Enter your current password"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-brand-charcoal dark:text-slate-200">New Password</label>
                                        <input 
                                            type="password" 
                                            className="w-full h-12 px-4 bg-brand-beige/30 dark:bg-white/5 border-1.5 border-brand-border rounded-xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal transition-all text-brand-charcoal dark:text-white font-medium text-sm"
                                            value={newPassword} 
                                            onChange={(e) => setNewPassword(e.target.value)} 
                                            required 
                                            minLength={8}
                                            placeholder="At least 8 characters"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-brand-charcoal dark:text-slate-200">Confirm New Password</label>
                                        <input 
                                            type="password" 
                                            className="w-full h-12 px-4 bg-brand-beige/30 dark:bg-white/5 border-1.5 border-brand-border rounded-xl focus:outline-none focus:border-brand-emerald focus:bg-white dark:focus:bg-brand-charcoal transition-all text-brand-charcoal dark:text-white font-medium text-sm"
                                            value={confirmPassword} 
                                            onChange={(e) => setConfirmPassword(e.target.value)} 
                                            required 
                                            minLength={8}
                                            placeholder="Re-enter new password"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={isSavingSecurity || (!currentPassword) || (newPassword !== confirmPassword)}
                                        className="w-full sm:w-auto h-12 px-8 bg-brand-emerald text-white rounded-xl font-bold text-sm shadow-md transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 border-none cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        {isSavingSecurity ? (
                                            <><Loader2 size={16} className="animate-spin" /> Saving Password...</>
                                        ) : (
                                            'Update Password'
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Active Logged-in Devices Section */}
                            <div className="space-y-4 pt-4 border-t border-brand-border">
                                <div>
                                    <h3 className="text-base font-bold text-brand-charcoal dark:text-white">Where You're Logged In</h3>
                                    <p className="text-xs text-brand-muted mt-0.5">These are the phones, computers, and browsers currently signed into your account.</p>
                                </div>
                                
                                {isLoadingSessions ? (
                                    <SkeletonRow />
                                ) : (
                                    <div className="space-y-3">
                                        {sessions.map((session) => (
                                            <div 
                                                key={session.id} 
                                                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-brand-beige/20 dark:bg-white/5 border rounded-2xl transition-all gap-3 ${
                                                    session.is_current ? 'border-brand-emerald/40 bg-brand-emerald/5' : 'border-brand-border'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${session.is_current ? 'bg-brand-emerald text-white shadow-sm' : 'bg-brand-beige dark:bg-white/10 text-brand-muted'}`}>
                                                        {session.name?.toLowerCase().includes('phone') || session.name?.toLowerCase().includes('android') || session.name?.toLowerCase().includes('iphone') ? (
                                                            <Smartphone size={18} />
                                                        ) : session.name?.toLowerCase().includes('pc') || session.name?.toLowerCase().includes('mac') || session.name?.toLowerCase().includes('windows') ? (
                                                            <Monitor size={18} />
                                                        ) : (
                                                            <Globe size={18} />
                                                        )}
                                                    </div>
                                                    <div className="space-y-0.5 min-w-0 flex-1">
                                                        <div className="text-sm font-bold text-brand-charcoal dark:text-white flex flex-wrap items-center gap-2">
                                                            <span className="truncate max-w-[200px] sm:max-w-none">{session.name}</span>
                                                            {session.is_current && (
                                                                <span className="text-[10px] bg-brand-emerald text-white px-2 py-0.5 rounded-full font-bold shrink-0">
                                                                    This Device
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-brand-muted flex items-center gap-1.5 truncate">
                                                            <span>{session.is_current ? 'Currently Active' : `Last active: ${session.last_used_at || 'Recently'}`}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="w-full sm:w-auto shrink-0 flex justify-end pt-1 sm:pt-0">
                                                    {!session.is_current ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleTerminateSession(session.id)}
                                                            className="w-full sm:w-auto h-9 px-4 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold border-none cursor-pointer transition-all active:scale-95"
                                                        >
                                                            Log Out
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={handleLogout}
                                                            className="w-full sm:w-auto h-9 px-4 bg-brand-beige dark:bg-white/10 text-brand-muted hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold border-none cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                                        >
                                                            <LogOut size={13} /> Sign Out
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2FA Setup Modal */}
            <TwoFactorSetupModal
                isOpen={isTwoFactorModalOpen}
                onClose={() => setIsTwoFactorModalOpen(false)}
            />
        </div>
    );
};

export default Account;