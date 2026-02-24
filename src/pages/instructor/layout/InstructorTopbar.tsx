import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, ChevronDown, Clock } from 'lucide-react';

interface InstructorTopbarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const InstructorTopbar = ({ collapsed, setCollapsed }: InstructorTopbarProps) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const bellBtnRef = useRef<HTMLButtonElement>(null);

    // Mock user data
    const userName = "Instructor Hub";
    const userRole = "Senior Instructor";
    const userInitial = "I";

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

                <div className="user-pill instructor-profile-pill">
                    <div className="user-avatar-small" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                        {userInitial}
                    </div>
                    <div className="user-info-text">
                        <span className="user-name">{userName}</span>
                        <span className="user-role">{userRole}</span>
                    </div>
                    <ChevronDown size={14} color="#94a3b8" />
                </div>
            </div>
        </header>
    );
};

export default InstructorTopbar;
