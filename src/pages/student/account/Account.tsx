import { useState, useEffect } from 'react';
import { User, Lock, Shield, LogOut, Loader2, Monitor, Globe } from 'lucide-react';
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
        <div className="account-page-wrapper animate-fade-in-up">
            <style>{`
                .account-page-wrapper {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 1rem;
                }

                .settings-header {
                    margin-bottom: 2.5rem;
                }

                .settings-header h1 {
                    font-size: 2.25rem;
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: -0.04em;
                    margin-bottom: 0.5rem;
                }

                .settings-header p {
                    color: #64748b;
                    font-size: 1.1rem;
                    font-weight: 500;
                }

                .premium-settings-card {
                    background: white;
                    border-radius: 32px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.03);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .settings-tabs-nav {
                    display: flex;
                    padding: 8px;
                    background: #f8fafc;
                    gap: 8px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .settings-tab-trigger {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 1rem;
                    border-radius: 20px;
                    font-weight: 800;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: none;
                    background: transparent;
                    color: #64748b;
                }

                .settings-tab-trigger.active {
                    background: white;
                    color: #0f172a;
                    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.05);
                }

                .settings-tab-trigger:hover:not(.active) {
                    background: rgba(255, 255, 255, 0.5);
                    color: #1e293b;
                }

                .settings-form-container {
                    padding: 3.5rem;
                }

                .profile-header-premium {
                    display: flex;
                    align-items: center;
                    gap: 2.5rem;
                    margin-bottom: 4rem;
                }

                .avatar-container-premium {
                    position: relative;
                }

                .avatar-main {
                    width: 120px;
                    height: 120px;
                    border-radius: 40px;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 2.5rem;
                    font-weight: 900;
                    box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.4);
                }

                .profile-info-text h2 {
                    font-size: 1.75rem;
                    font-weight: 900;
                    color: #0f172a;
                    margin-bottom: 0.75rem;
                    letter-spacing: -0.02em;
                }

                .profile-tags-row {
                    display: flex;
                    gap: 12px;
                }

                .tag-premium {
                    padding: 6px 14px;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .tag-blue { background: #eff6ff; color: #1e40af; }
                .tag-green { background: #f0fdf4; color: #166534; }

                .form-grid-premium {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    margin-bottom: 2.5rem;
                }

                .input-wrapper-premium {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .input-wrapper-premium label {
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .input-field-container {
                    position: relative;
                    height: 56px;
                    display: flex;
                    align-items: center;
                }

                .premium-input {
                    width: 100%;
                    height: 56px;
                    padding: 0 1.5rem;
                    border-radius: 20px;
                    border: 2px solid #f1f5f9;
                    background: #fcfdfe;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0f172a;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                }

                .premium-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    background: white;
                    box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.1);
                }

                .premium-input::placeholder {
                    color: #94a3b8;
                    font-weight: 500;
                    opacity: 0.7;
                    transition: all 0.3s;
                }

                .premium-input:focus::placeholder {
                    opacity: 0.4;
                    transform: translateX(4px);
                }

                .premium-input.readonly {
                    background: #f8fafc;
                    cursor: not-allowed;
                    color: #64748b;
                }

                .btn-save-premium {
                    padding: 1.25rem 3rem;
                    border-radius: 20px;
                    background: #0f172a;
                    color: white;
                    font-weight: 850;
                    font-size: 1rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 15px 30px -8px rgba(15, 23, 42, 0.3);
                }

                .btn-save-premium:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.4);
                    background: #1e293b;
                }

                .btn-save-premium:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .security-hero-banner {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    border-radius: 24px;
                    padding: 2.5rem;
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    color: white;
                    margin-bottom: 3.5rem;
                }

                .hero-icon-box {
                    width: 70px;
                    height: 70px;
                    background: rgba(16, 185, 129, 0.15);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #10b981;
                }

                .hero-text h4 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    margin-bottom: 6px;
                }

                .hero-text p {
                    color: #94a3b8;
                    font-size: 0.95rem;
                    font-weight: 500;
                }

                .session-card-premium {
                    background: #fcfdfe;
                    border: 2px solid #f1f5f9;
                    padding: 1.5rem;
                    border-radius: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.3s;
                }

                .session-card-premium:hover {
                    border-color: #e2e8f0;
                    background: white;
                }

                .session-main {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                .session-icon {
                    width: 50px;
                    height: 50px;
                    background: white;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                }

                .session-icon.active {
                    background: #f0fdf4;
                    border-color: #bbf7d0;
                    color: #166534;
                }

                .session-details h5 {
                    font-size: 1rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 4px;
                }

                .session-details p {
                    font-size: 0.85rem;
                    color: #64748b;
                    font-weight: 500;
                }

                .btn-terminate-premium {
                    background: #fff1f2;
                    color: #e11d48;
                    padding: 10px 18px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 800;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-terminate-premium:hover {
                    background: #ffe4e6;
                    transform: scale(1.05);
                }

                @media (max-width: 768px) {
                    .account-page-wrapper {
                        padding: 0.5rem;
                    }

                    .settings-header h1 {
                        font-size: 1.75rem;
                    }

                    .premium-settings-card {
                        border-radius: 20px;
                    }

                    .settings-tabs-nav {
                        overflow-x: auto;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                        padding: 6px;
                    }

                    .settings-tabs-nav::-webkit-scrollbar {
                        display: none;
                    }

                    .settings-tab-trigger {
                        white-space: nowrap;
                        padding: 0.75rem 1rem;
                        font-size: 0.85rem;
                        min-width: fit-content;
                    }

                    .settings-form-container {
                        padding: 2rem 1.25rem;
                    }

                    .profile-header-premium {
                        flex-direction: column;
                        text-align: center;
                        gap: 1.5rem;
                        margin-bottom: 2.5rem;
                    }

                    .avatar-main {
                        width: 100px;
                        height: 100px;
                        font-size: 2rem;
                    }

                    .profile-tags-row {
                        justify-content: center;
                        flex-wrap: wrap;
                    }

                    .form-grid-premium {
                        grid-template-columns: 1fr;
                        gap: 1.25rem;
                    }

                    .security-hero-banner {
                        padding: 1.5rem;
                        flex-direction: column;
                        text-align: center;
                        gap: 1rem;
                    }

                    .hero-icon-box {
                        width: 60px;
                        height: 60px;
                    }

                    .btn-save-premium {
                        width: 100%;
                        justify-content: center;
                        padding: 1.1rem;
                    }

                    .session-card-premium {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.25rem;
                        padding: 1.25rem;
                    }

                    .btn-terminate-premium {
                        width: 100%;
                    }
                }
            `}</style>

            <div className="settings-header">
                <h1>Account Settings</h1>
                <p>Manage your profile identity and security protocols</p>
            </div>

            <div className="premium-settings-card">
                <div className="settings-tabs-nav">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`settings-tab-trigger ${activeTab === 'profile' ? 'active' : ''}`}
                    >
                        <User size={20} />
                        Identity Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`settings-tab-trigger ${activeTab === 'security' ? 'active' : ''}`}
                    >
                        <Shield size={20} />
                        Security Gateway
                    </button>
                </div>

                <div className="settings-form-container">
                    {activeTab === 'profile' && (
                        <div className="animate-fade-in-up">
                            <div className="profile-header-premium">
                                <div className="avatar-container-premium">
                                    <div className="avatar-main">
                                        {firstName.charAt(0)}{lastName ? lastName.charAt(0) : ''}
                                    </div>
                                </div>
                                <div className="profile-info-text">
                                    <h2>{user?.name}</h2>
                                    <div className="profile-tags-row">
                                        <div className="tag-premium tag-blue">STUDENT ID: {user?.id?.toString().padStart(6, '0')}</div>
                                        <div className="tag-premium tag-green">VERIFIED STATUS</div>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSaveProfile}>
                                <div className="form-grid-premium">
                                    <div className="input-wrapper-premium">
                                        <label>First Name</label>
                                        <div className="input-field-container">
                                            <input type="text" className="premium-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="First name" />
                                        </div>
                                    </div>
                                    <div className="input-wrapper-premium">
                                        <label>Last Name</label>
                                        <div className="input-field-container">
                                            <input type="text" className="premium-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Last name" />
                                        </div>
                                    </div>
                                </div>

                                <div className="input-wrapper-premium" style={{ marginBottom: '3rem' }}>
                                    <label>Email Address</label>
                                    <div className="input-field-container">
                                        <input type="email" className="premium-input readonly" value={user?.email || ''} readOnly />
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Lock size={12} /> Contact administrator to modify email endpoint
                                    </p>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn-save-premium" disabled={isSavingProfile}>
                                        {isSavingProfile ? <><Loader2 size={20} className="animate-spin" /> SYNCHRONIZING...</> : 'UPDATE PROFILE'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="animate-fade-in-up">
                            <div className="security-hero-banner">
                                <div className="hero-icon-box">
                                    <Shield size={32} />
                                </div>
                                <div className="hero-text">
                                    <h4>Account Security Protocol</h4>
                                    <p>Your access is secured with industry-standard encryption. Modify your credentials below.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveSecurity}>
                                <div className="input-wrapper-premium" style={{ marginBottom: '2rem' }}>
                                    <label>Current Authentication Password</label>
                                    <div className="input-field-container">
                                        <input type="password" placeholder="••••••••" className="premium-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                                    </div>
                                </div>

                                <div className="form-grid-premium" style={{ marginBottom: '3.5rem' }}>
                                    <div className="input-wrapper-premium">
                                        <label>New Security Key</label>
                                        <div className="input-field-container">
                                            <input type="password" placeholder="Min. 8 characters" className="premium-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
                                        </div>
                                    </div>
                                    <div className="input-wrapper-premium">
                                        <label>Verify Security Key</label>
                                        <div className="input-field-container">
                                            <input type="password" placeholder="Repeat new key" className="premium-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '3.5rem', marginBottom: '3.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="btn-save-premium" style={{ background: '#3b82f6', boxShadow: '0 15px 30px -8px rgba(59, 130, 246, 0.3)' }} disabled={isSavingSecurity || (!currentPassword) || (newPassword !== confirmPassword)}>
                                        {isSavingSecurity ? <><Loader2 size={20} className="animate-spin" /> UPDATING GATEWAY...</> : 'UPDATE SECURITY KEYS'}
                                    </button>
                                </div>

                                <div className="session-management">
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Active Session Log</h4>
                                    
                                    {isLoadingSessions ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                            <Loader2 size={32} className="animate-spin" color="#3b82f6" />
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                                            {sessions.map((session) => (
                                                <div key={session.id} className="session-card-premium" style={{ opacity: session.is_current ? 1 : 0.85 }}>
                                                    <div className="session-main">
                                                        <div className={`session-icon ${session.is_current ? 'active' : ''}`}>
                                                            {session.name.includes('PC') || session.name.includes('Mac') || session.name.includes('Linux') ? <Monitor size={24} /> : <Globe size={24} />}
                                                        </div>
                                                        <div className="session-details">
                                                            <h5>{session.name}</h5>
                                                            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <Globe size={14} /> {session.is_current ? 'Current Access Point • Active Now' : `Last active ${session.last_used_at}`} 
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {!session.is_current ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleTerminateSession(session.id)}
                                                            className="btn-terminate-premium"
                                                        >
                                                            Terminate
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={handleLogout}
                                                            className="btn-terminate-premium"
                                                            style={{ background: '#f8fafc', color: '#64748b' }}
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
