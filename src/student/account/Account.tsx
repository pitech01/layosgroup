import { useState } from 'react';
import { User, Mail, Lock, Shield, Camera, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Account = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const tabButtonStyle = (isActive: boolean) => ({
        padding: '1rem 2rem',
        fontSize: '0.95rem',
        fontWeight: 600,
        color: isActive ? '#3b82f6' : '#64748b',
        borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
        background: 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s',
        flex: 1,
        textAlign: 'center' as const
    });

    const formGroupStyle = {
        marginBottom: '1.5rem'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#1e293b',
        marginBottom: '0.5rem'
    };

    const inputWrapperStyle = {
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center'
    };

    const inputIconStyle = {
        position: 'absolute' as const,
        left: '1rem',
        color: '#94a3b8'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem 0.75rem 2.75rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '0.95rem',
        color: '#0f172a',
        backgroundColor: '#f8fafc',
        outline: 'none',
        transition: 'border-color 0.2s'
    };

    return (
        <div className="animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem', color: '#0f172a' }}>Account Settings</h1>

            <div className="section-card" style={{ padding: 0, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <button
                        onClick={() => setActiveTab('profile')}
                        style={tabButtonStyle(activeTab === 'profile')}
                    >
                        Profile Information
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        style={tabButtonStyle(activeTab === 'security')}
                    >
                        Security & Password
                    </button>
                </div>

                <div style={{ padding: '3rem' }}>
                    {activeTab === 'profile' && (
                        <div className="animate-fade-in-up">
                            {/* Profile Picture */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: '#94a3b8', border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                        AS
                                    </div>
                                    <button style={{ position: 'absolute', bottom: 0, right: 0, background: '#3b82f6', color: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.15)', transition: 'transform 0.1s' }}>
                                        <Camera size={18} />
                                    </button>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Anna Student</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '0.75rem' }}>Student ID: <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>#883920</span></p>
                                </div>
                            </div>

                            {/* Form */}
                            <form style={{ maxWidth: '100%' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <label style={labelStyle}>First Name</label>
                                        <div style={inputWrapperStyle}>
                                            <User size={18} style={inputIconStyle} />
                                            <input type="text" defaultValue="Anna" style={inputStyle} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Last Name</label>
                                        <div style={inputWrapperStyle}>
                                            <User size={18} style={inputIconStyle} />
                                            <input type="text" defaultValue="Student" style={inputStyle} />
                                        </div>
                                    </div>
                                </div>

                                <div style={formGroupStyle}>
                                    <label style={labelStyle}>Email Address</label>
                                    <div style={inputWrapperStyle}>
                                        <Mail size={18} style={inputIconStyle} />
                                        <input type="email" defaultValue="anna@student.com" readOnly style={{ ...inputStyle, background: '#f8fafc', color: '#64748b', cursor: 'not-allowed', borderColor: '#e2e8f0' }} />
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Lock size={12} /> Email cannot be changed
                                    </p>
                                </div>

                                <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="button" style={{ background: '#0f172a', color: 'white', padding: '0.875rem 2rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px rgba(15, 23, 42, 0.1)' }}>
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="animate-fade-in-up">
                            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                                <Shield className="text-yellow-600" size={28} style={{ color: '#d97706' }} />
                                <div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#92400e', marginBottom: '0.25rem' }}>Security Status: Good</h4>
                                    <p style={{ fontSize: '0.9rem', color: '#b45309', margin: 0, lineHeight: 1.5 }}>Your account is secured. Last login was detected from Windows PC on Feb 14, 2024.</p>
                                </div>
                            </div>

                            <form style={{ maxWidth: '100%' }}>
                                <div style={formGroupStyle}>
                                    <label style={labelStyle}>Current Password</label>
                                    <div style={inputWrapperStyle}>
                                        <Lock size={18} style={inputIconStyle} />
                                        <input type="password" placeholder="••••••••" style={inputStyle} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                    <div>
                                        <label style={labelStyle}>New Password</label>
                                        <div style={inputWrapperStyle}>
                                            <Lock size={18} style={inputIconStyle} />
                                            <input type="password" placeholder="New password" style={inputStyle} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Confirm Password</label>
                                        <div style={inputWrapperStyle}>
                                            <Lock size={18} style={inputIconStyle} />
                                            <input type="password" placeholder="Confirm password" style={inputStyle} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '2.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="button" style={{ background: '#0f172a', color: 'white', padding: '0.875rem 2rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px rgba(15, 23, 42, 0.1)' }}>
                                        Update Password
                                    </button>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Session Management</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div>
                                            <p style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Active Sessions</p>
                                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Log out of all other devices.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 600, background: 'white', border: '1px solid #ef4444', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            <LogOut size={16} />
                                            Log Out All
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
