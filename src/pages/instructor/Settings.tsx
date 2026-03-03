import { useState } from 'react';
import {
    User,
    Mail,
    Lock,
    Shield,
    Camera,
    LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert('Settings synchronized successfully.');
        }, 1500);
    };

    const handleLogout = () => {
        logout();
        navigate('/instructor-login');
    };

    return (
        <div className="animate-fade-in-up instructor-settings-container">
            <style>{`
                .instructor-settings-container {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .settings-header {
                    margin-bottom: 2.5rem;
                }

                .settings-header h1 {
                    font-size: 2.25rem;
                    font-weight: 950;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.03em;
                }

                .settings-card {
                    background: white;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 32px;
                    overflow: hidden;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.02);
                }

                .settings-tabs-nav {
                    display: flex;
                    padding: 1.5rem 2rem;
                    background: #f8fafc;
                    border-bottom: 1px solid #f1f5f9;
                    gap: 1rem;
                    overflow-x: auto;
                }

                .settings-tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1.25rem;
                    border-radius: 14px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-weight: 700;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .settings-tab-btn:hover {
                    background: #f1f5f9;
                    color: #0f172a;
                }

                .settings-tab-btn.active {
                    background: white;
                    color: #1a4d3e;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }

                .settings-content-body {
                    padding: 3rem;
                }

                .profile-setup-grid {
                    display: flex;
                    gap: 4rem;
                }

                @media (max-width: 768px) {
                    .profile-setup-grid {
                        flex-direction: column;
                        gap: 2rem;
                    }
                }

                .avatar-editor-col {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                }

                .instructor-avatar-large {
                    width: 160px;
                    height: 160px;
                    border-radius: 40px;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 3rem;
                    font-weight: 950;
                    color: #1a4d3e;
                    position: relative;
                    border: 4px solid white;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                }

                .avatar-update-badge {
                    position: absolute;
                    bottom: -10px;
                    right: -10px;
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    background: #1a4d3e;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border: 4px solid white;
                    transition: all 0.2s;
                }

                .avatar-update-badge:hover {
                    transform: scale(1.1);
                }

                .settings-form-col {
                    flex: 1;
                }

                .input-field-group {
                    margin-bottom: 1.75rem;
                }

                .input-field-group label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: #0f172a;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.75rem;
                }

                .premium-input-wrapper {
                    position: relative;
                }

                .premium-input-icon {
                    position: absolute;
                    left: 1.25rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }

                .premium-text-input {
                    width: 100%;
                    height: 56px;
                    padding: 0 1.25rem 0 3.5rem;
                    background: #f8fafc;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 16px;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0f172a;
                    transition: all 0.2s;
                }

                .premium-text-input:focus {
                    background: white;
                    border-color: #1a4d3e;
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(26, 77, 62, 0.05);
                }

                .premium-textarea {
                    width: 100%;
                    padding: 1.25rem;
                    background: #f8fafc;
                    border: 1.5px solid #f1f5f9;
                    border-radius: 16px;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0f172a;
                    min-height: 120px;
                    resize: vertical;
                    transition: all 0.2s;
                }

                .premium-textarea:focus {
                    background: white;
                    border-color: #1a4d3e;
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(26, 77, 62, 0.05);
                }

                .settings-action-row {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 3rem;
                    padding-top: 2rem;
                    border-top: 1px solid #f1f5f9;
                }

                .btn-premium-save {
                    height: 52px;
                    padding: 0 2.5rem;
                    background: #1a4d3e;
                    color: white;
                    border: none;
                    border-radius: 16px;
                    font-size: 0.95rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 10px 15px -3px rgba(26, 77, 62, 0.2);
                }

                .btn-premium-save:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 20px -5px rgba(26, 77, 62, 0.3);
                    filter: brightness(1.1);
                }

                .security-status-box {
                    background: #f0fdf4;
                    border: 1.5px solid #dcfce7;
                    border-radius: 20px;
                    padding: 1.5rem;
                    display: flex;
                    gap: 1.25rem;
                    align-items: center;
                    margin-bottom: 2.5rem;
                }

                .status-icon-glow {
                    width: 52px;
                    height: 52px;
                    background: #16a34a;
                    color: white;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 15px rgba(22, 163, 74, 0.2);
                }

                .session-management-section {
                    margin-top: 4rem;
                }

                .session-card-premium {
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 20px;
                    padding: 1.25rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .btn-outline-danger-premium {
                    background: transparent;
                    border: 2px solid #fee2e2;
                    color: #ef4444;
                    padding: 0.6rem 1.25rem;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn-outline-danger-premium:hover {
                    background: #fef2f2;
                    border-color: #fecaca;
                }
            `}</style>

            <header className="settings-header">
                <h1>Setting</h1>
                <p style={{ color: '#64748b', fontWeight: 600, marginTop: '0.5rem' }}>Manage your profile and security settings.</p>
            </header>

            <div className="settings-card">
                <nav className="settings-tabs-nav">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    >
                        <User size={20} /> Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`settings-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                    >
                        <Shield size={20} /> Security
                    </button>
                </nav>

                <div className="settings-content-body">
                    {activeTab === 'profile' && (
                        <div className="animate-fade-in-up">
                            <div className="profile-setup-grid">
                                <div className="avatar-editor-col">
                                    <div className="instructor-avatar-large">
                                        LD
                                        <div className="avatar-update-badge" title="Upload New Identity Media">
                                            <Camera size={20} />
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Lead Instructor</h4>
                                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>ID: INS-2294-00</p>
                                    </div>
                                </div>

                                <div className="settings-form-col">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div className="input-field-group">
                                            <label>First Name</label>
                                            <div className="premium-input-wrapper">
                                                <User size={20} className="premium-input-icon" />
                                                <input type="text" className="premium-text-input" defaultValue="Lead" />
                                            </div>
                                        </div>
                                        <div className="input-field-group">
                                            <label>Last Name</label>
                                            <div className="premium-input-wrapper">
                                                <User size={20} className="premium-input-icon" />
                                                <input type="text" className="premium-text-input" defaultValue="Instructor" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="input-field-group">
                                        <label>Email Address</label>
                                        <div className="premium-input-wrapper">
                                            <Mail size={20} className="premium-input-icon" />
                                            <input type="email" className="premium-text-input" defaultValue="instructor@layosgroup.com" />
                                        </div>
                                    </div>

                                    <div className="input-field-group">
                                        <label>Professional Biography</label>
                                        <textarea
                                            className="premium-textarea"
                                            placeholder="Outline your professional background and teaching philosophy..."
                                            defaultValue="Expert in software engineering and system architecture."
                                        ></textarea>
                                    </div>

                                    <div className="settings-action-row">
                                        <button
                                            className="btn-premium-save"
                                            onClick={handleSave}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Saving...' : 'Save Profile'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="animate-fade-in-up">
                            <div className="security-status-box">
                                <div className="status-icon-glow">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#065f46' }}>Security Layer: Reinforced</h4>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#047857', fontWeight: 600 }}>Your command node is currently protected by high-level encryption protocols.</p>
                                </div>
                            </div>

                            <div className="settings-form-col" style={{ maxWidth: '600px' }}>
                                <div className="input-field-group">
                                    <label>Current Password</label>
                                    <div className="premium-input-wrapper">
                                        <Lock size={20} className="premium-input-icon" />
                                        <input type="password" password-reveal="true" className="premium-text-input" placeholder="••••••••••••" />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2.5rem' }}>
                                    <div className="input-field-group">
                                        <label>New Password</label>
                                        <div className="premium-input-wrapper">
                                            <Lock size={20} className="premium-input-icon" />
                                            <input type="password" className="premium-text-input" placeholder="Enter new key" />
                                        </div>
                                    </div>
                                    <div className="input-field-group">
                                        <label>Confirm New Password</label>
                                        <div className="premium-input-wrapper">
                                            <Lock size={20} className="premium-input-icon" />
                                            <input type="password" className="premium-text-input" placeholder="Confirm new key" />
                                        </div>
                                    </div>
                                </div>

                                <div className="settings-action-row">
                                    <button
                                        className="btn-premium-save"
                                        style={{ background: '#3b82f6', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2)' }}
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>

                                <div className="session-management-section">
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1.5rem' }}>Active Sessions</h3>
                                    <div className="session-card-premium">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 10px rgba(22, 163, 74, 0.5)' }}></div>
                                            <div>
                                                <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Windows 11 Node • Lagos, NG</h5>
                                                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Current Session • Active Now</p>
                                            </div>
                                        </div>
                                        <button className="btn-outline-danger-premium" onClick={handleLogout}>
                                            <LogOut size={16} /> Terminate Sessions
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
