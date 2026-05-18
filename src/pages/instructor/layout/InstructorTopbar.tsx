import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, ChevronDown, Clock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface InstructorTopbarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const InstructorTopbar = ({ collapsed, setCollapsed }: InstructorTopbarProps) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const notificationRef = useRef<HTMLDivElement>(null);
    const bellBtnRef = useRef<HTMLButtonElement>(null);
    const profileBtnRef = useRef<HTMLDivElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // Dynamic user data
    const userName = user?.name || "Instructor Hub";
    const userRole = user?.role === 'instructor' ? "Lead Instructor" : "Administrator";
    const userInitial = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : "I";

    // Mock notifications
    const notifications = [
        { id: 1, title: 'New Student Enrolled', desc: 'Alex Johnson joined "Frontend Dev Bootcamp".', time: '5m ago', unread: true },
        { id: 2, title: 'Live Class Reminder', desc: 'Your session "Advanced React" starts in 30 mins.', time: '1h ago', unread: true },
        { id: 3, title: 'Review Received', desc: 'New 5-star review for "UI/UX Design".', time: '1d ago', unread: false },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target as Node) &&
                bellBtnRef.current &&
                !bellBtnRef.current.contains(event.target as Node)
            ) {
                setShowNotifications(false);
            }

            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target as Node) &&
                profileBtnRef.current &&
                !profileBtnRef.current.contains(event.target as Node)
            ) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="top-nav-bar instructor-top-nav">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="sidebar-toggle-btn instructor-toggle"
                    title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <Menu size={24} strokeWidth={2} />
                </button>
                <div style={{ flex: 1 }}></div>
            </div>

            <div className="top-nav-actions">
                <div style={{ position: 'relative' }}>
                    <button
                        ref={bellBtnRef}
                        className={`notifications-btn instructor-notif ${showNotifications ? 'active' : ''}`}
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && <div className="notification-dot active"></div>}
                    </button>

                    {showNotifications && (
                        <div className="notifications-dropdown" ref={notificationRef}>
                            <div className="notification-header">
                                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>Notifications</span>
                                <button style={{ fontSize: '0.75rem', color: '#8b5cf6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                                    Mark all read
                                </button>
                            </div>
                            <div className="notification-list">
                                {notifications.map(notification => (
                                    <div key={notification.id} className={`notification-item ${notification.unread ? 'unread' : ''}`}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>{notification.title}</h4>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={10} /> {notification.time}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>{notification.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ position: 'relative' }}>
                    <div
                        className="user-pill instructor-profile-pill"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        ref={profileBtnRef}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="user-avatar-small" style={{ background: '#1a4d3e' }}>
                            {userInitial}
                        </div>
                        <div className="user-info-text">
                            <span className="user-name">{userName}</span>
                            <span className="user-role">{userRole}</span>
                        </div>
                        <ChevronDown size={14} color="#94a3b8" style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                    </div>

                    {showProfileMenu && (
                        <div className="profile-dropdown shadow-premium" ref={profileMenuRef} style={{
                            position: 'absolute',
                            top: 'calc(100% + 12px)',
                            right: 0,
                            width: '200px',
                            background: 'white',
                            borderRadius: '16px',
                            padding: '0.75rem',
                            border: '1.5px solid #f1f5f9',
                            zIndex: 1000
                        }}>
                            <div
                                onClick={() => { navigate('/instructor/settings'); setShowProfileMenu(false); }}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    color: '#475569',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1a4d3e' }}></span>
                                My Profile
                            </div>
                            <div style={{ height: '1px', background: '#f1f5f9', margin: '0.5rem 0' }}></div>
                            <div
                                onClick={() => logout()}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    color: '#ef4444',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                                Sign Out
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default InstructorTopbar;
