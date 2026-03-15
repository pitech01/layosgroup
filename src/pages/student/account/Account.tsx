import { useState, useEffect } from 'react';
import { User, Mail, Lock, Shield, Camera, LogOut, Loader2, Monitor, Globe } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Account = () => {
    const { user, logout, updateUserInfo } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    // Profile State
    const nameParts = user?.name ? user.name.split(' ') : [''];
    const initialFirstName = nameParts[0] || '';
    const initialLastName = nameParts.slice(1).join(' ') || '';

    const [firstName, setFirstName] = useState(initialFirstName);
    const [lastName, setLastName] = useState(initialLastName);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Security State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSavingSecurity, setIsSavingSecurity] = useState(false);
    
    // Sessions State
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
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            const token = localStorage.getItem('token');
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
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            const token = localStorage.getItem('token');
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
        <div className="animate-fade-in-up account-container">
            <h1 className="dashboard-header-title">Account Settings</h1>

            <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="account-tabs-header">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`account-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    >
                        <User size={18} />
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`account-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                    >
                        <Shield size={18} />
                        Security
                    </button>
                </div>

                <div className="account-content-area">
                    {activeTab === 'profile' && (
                        <div className="animate-fade-in-up">
                            {/* Profile Picture Section */}
                            <div className="profile-picture-section">
                                <div className="avatar-wrapper">
                                    <div className="avatar-circle">
                                        {firstName.charAt(0)}{lastName ? lastName.charAt(0) : ''}
                                    </div>
                                    <button className="avatar-upload-btn" title="Change Avatar">
                                        <Camera size={18} />
                                    </button>
                                </div>
                                <div className="profile-identity">
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>{user?.name}</h3>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', padding: '0.4rem 0.75rem', borderRadius: '8px', fontWeight: 600 }}>ID: #{user?.id?.toString().padStart(6, '0')}</span>
                                        <span style={{ fontSize: '0.85rem', color: '#10b981', background: '#ecfdf5', padding: '0.4rem 0.75rem', borderRadius: '8px', fontWeight: 600 }}>Active Student</span>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Form */}
                            <form className="animate-fade-in-up" onSubmit={handleSaveProfile}>
                                <div className="responsive-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className="input-group-modern">
                                        <label className="input-label-modern">First Name</label>
                                        <div className="input-with-icon">
                                            <User size={18} className="input-icon" />
                                            <input type="text" className="custom-input-modern" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="input-group-modern">
                                        <label className="input-label-modern">Last Name</label>
                                        <div className="input-with-icon">
                                            <User size={18} className="input-icon" />
                                            <input type="text" className="custom-input-modern" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                                        </div>
                                    </div>
                                </div>

                                <div className="input-group-modern" style={{ marginBottom: '1.5rem' }}>
                                    <label className="input-label-modern">Email Address</label>
                                    <div className="input-with-icon">
                                        <Mail size={18} className="input-icon" />
                                        <input type="email" className="custom-input-modern readonly" value={user?.email || ''} readOnly />
                                    </div>
                                    <small style={{ color: '#94a3b8', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                                        <Lock size={12} /> Email is managed by administrator
                                    </small>
                                </div>

                                <div className="form-actions-bar">
                                    <button type="submit" className="btn-save-settings" disabled={isSavingProfile}>
                                        {isSavingProfile ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="animate-fade-in-up">
                            <div className="security-alert-box">
                                <div className="alert-icon-wrapper">
                                    <Shield size={28} />
                                </div>
                                <div>
                                    <h4 className="alert-title">Account Security: Optimal</h4>
                                    <p className="alert-desc">Your account is well protected. Last security activity was a login from Lagos, NG on Linux Chrome.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveSecurity}>
                                <div className="input-group-modern" style={{ marginBottom: '2rem' }}>
                                    <label className="input-label-modern">Current Password</label>
                                    <div className="input-with-icon">
                                        <Lock size={18} className="input-icon" />
                                        <input type="password" placeholder="••••••••" className="custom-input-modern" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                                    </div>
                                </div>

                                <div className="responsive-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                    <div className="input-group-modern">
                                        <label className="input-label-modern">New Password</label>
                                        <div className="input-with-icon">
                                            <Lock size={18} className="input-icon" />
                                            <input type="password" placeholder="Enter new password" className="custom-input-modern" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
                                        </div>
                                    </div>
                                    <div className="input-group-modern">
                                        <label className="input-label-modern">Confirm Password</label>
                                        <div className="input-with-icon">
                                            <Lock size={18} className="input-icon" />
                                            <input type="password" placeholder="Repeat new password" className="custom-input-modern" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '2.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn-save-settings" style={{ background: '#3b82f6' }} disabled={isSavingSecurity || (!currentPassword) || (newPassword !== confirmPassword)}>
                                        {isSavingSecurity ? <><Loader2 size={18} className="animate-spin" /> Updating...</> : 'Update Password'}
                                    </button>
                                </div>

                                <div className="session-management">
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>Active Sessions</h4>
                                    
                                    {isLoadingSessions ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                            <Loader2 size={24} className="animate-spin" color="#3b82f6" />
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            {sessions.map((session) => (
                                                <div key={session.id} className="session-card-modern" style={{ opacity: session.is_current ? 1 : 0.8 }}>
                                                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                                        <div style={{ width: '40px', height: '40px', background: session.is_current ? '#ecfdf5' : '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: session.is_current ? '#10b981' : '#64748b' }}>
                                                            {session.name.includes('PC') || session.name.includes('Mac') || session.name.includes('Linux') ? <Monitor size={20} /> : <Monitor size={20} />}
                                                        </div>
                                                        <div className="session-info">
                                                            <h5 style={{ fontWeight: 800 }}>{session.name}</h5>
                                                            <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <Globe size={12} /> {session.is_current ? 'Current Device • Active Now' : `Last active ${session.last_used_at}`} 
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {!session.is_current && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleTerminateSession(session.id)}
                                                            className="btn-outline-danger"
                                                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                                        >
                                                            Terminate
                                                        </button>
                                                    )}
                                                    {session.is_current && (
                                                        <button
                                                            type="button"
                                                            onClick={handleLogout}
                                                            className="btn-outline-danger"
                                                            style={{ border: 'none', background: '#fef2f2' }}
                                                        >
                                                            <LogOut size={16} /> Sign Out
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
