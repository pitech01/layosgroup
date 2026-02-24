import { useState } from 'react';
import { User, Mail, Lock, Shield, Camera, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Account = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    const handleLogout = () => {
        logout();
        navigate('/login');
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
                                        AS
                                    </div>
                                    <button className="avatar-upload-btn" title="Change Avatar">
                                        <Camera size={18} />
                                    </button>
                                </div>
                                <div className="profile-identity">
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Anna Student</h3>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', padding: '0.4rem 0.75rem', borderRadius: '8px', fontWeight: 600 }}>ID: #883920</span>
                                        <span style={{ fontSize: '0.85rem', color: '#10b981', background: '#ecfdf5', padding: '0.4rem 0.75rem', borderRadius: '8px', fontWeight: 600 }}>Active Student</span>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Form */}
                            <form className="animate-fade-in-up">
                                <div className="responsive-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className="input-group-modern">
                                        <label className="input-label-modern">First Name</label>
                                        <div className="input-with-icon">
                                            <User size={18} className="input-icon" />
                                            <input type="text" className="custom-input-modern" defaultValue="Anna" />
                                        </div>
                                    </div>
                                    <div className="input-group-modern">
                                        <label className="input-label-modern">Last Name</label>
                                        <div className="input-with-icon">
                                            <User size={18} className="input-icon" />
                                            <input type="text" className="custom-input-modern" defaultValue="Student" />
                                        </div>
                                    </div>
                                </div>

                                <div className="input-group-modern" style={{ marginBottom: '1.5rem' }}>
                                    <label className="input-label-modern">Email Address</label>
                                    <div className="input-with-icon">
                                        <Mail size={18} className="input-icon" />
                                        <input type="email" className="custom-input-modern readonly" defaultValue="anna@student.com" readOnly />
                                    </div>
                                    <small style={{ color: '#94a3b8', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                                        <Lock size={12} /> Email is managed by administrator
                                    </small>
                                </div>

                                <div className="form-actions-bar">
                                    <button type="button" className="btn-save-settings">
                                        Save Changes
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

                            <form>
                                <div className="input-group-modern" style={{ marginBottom: '2rem' }}>
                                    <label className="input-label-modern">Current Password</label>
                                    <div className="input-with-icon">
                                        <Lock size={18} className="input-icon" />
                                        <input type="password" placeholder="••••••••" className="custom-input-modern" />
                                    </div>
                                </div>

                                <div className="responsive-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                    <div className="input-group-modern">
                                        <label className="input-label-modern">New Password</label>
                                        <div className="input-with-icon">
                                            <Lock size={18} className="input-icon" />
                                            <input type="password" placeholder="Enter new password" className="custom-input-modern" />
                                        </div>
                                    </div>
                                    <div className="input-group-modern">
                                        <label className="input-label-modern">Confirm Password</label>
                                        <div className="input-with-icon">
                                            <Lock size={18} className="input-icon" />
                                            <input type="password" placeholder="Repeat new password" className="custom-input-modern" />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '2.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn-save-settings" style={{ background: '#3b82f6' }}>
                                        Update Password
                                    </button>
                                </div>

                                <div className="session-management">
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>Active Sessions</h4>
                                    <div className="session-card-modern">
                                        <div className="session-info">
                                            <h5>Windows PC • Lagos, Nigeria</h5>
                                            <p>This Device • Active Now</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="btn-outline-danger"
                                        >
                                            <LogOut size={16} />
                                            Sign Out All
                                        </button>
                                    </div>
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
