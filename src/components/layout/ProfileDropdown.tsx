import { ChevronDown, User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProfileDropdownProps {
    role: 'instructor' | 'student';
}

const ProfileDropdown = ({ role }: ProfileDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Dynamic user data
    const userData = {
        name: user?.name || (role === 'instructor' ? 'Instructor' : 'Student'),
        email: user?.email || (role === 'instructor' ? 'instructor@layos.edu' : 'student@layos.edu'),
        tier: user?.role === 'instructor' ? 'Instructor' : (user?.role === 'admin' ? 'Administrator' : 'Premium Plan')
    };

    const userInitial = userData.name.charAt(0).toUpperCase();

    const handleLogout = () => {
        logout();
        navigate(role === 'instructor' ? '/instructor-login' : '/login');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div style={{ position: 'relative' }}>
            <div
                ref={buttonRef}
                className="user-profile-pill"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={`user-avatar-small ${role === 'instructor' ? 'instructor-bg' : ''}`} style={{
                    background: role === 'instructor' ? '#0f172a' : '#3b82f6',
                    width: '32px',
                    height: '32px',
                    flexShrink: 0
                }}>
                    {userInitial}
                </div>
                <div className="user-info-text">
                    <span className="user-name">{userData.name}</span>
                    <span className="user-role">{userData.tier}</span>
                </div>
                <ChevronDown
                    size={14}
                    className="dropdown-arrow"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                />
            </div>

            {isOpen && (
                <div className="notifications-dropdown-premium" ref={dropdownRef} style={{ width: '240px', right: 0, top: '50px', padding: '8px' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px' }}>
                        <p style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{userData.name}</p>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem' }}>{userData.email}</p>
                    </div>

                    <button
                        onClick={() => { setIsOpen(false); navigate(role === 'instructor' ? '/instructor/settings' : '/student/account'); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', background: 'none', border: 'none', borderRadius: '10px', color: '#475569', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                        <User size={18} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>My Profile</span>
                    </button>

                    <div style={{ margin: '8px 0', borderTop: '1px solid #f1f5f9' }}></div>

                    <button
                        onClick={handleLogout}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', background: 'none', border: 'none', borderRadius: '10px', color: '#ef4444', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                        <LogOut size={18} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Sign Out</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
