import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, ChevronDown, CheckCheck, Clock } from 'lucide-react';

interface TopbarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const Topbar = ({ collapsed, setCollapsed }: TopbarProps) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const bellBtnRef = useRef<HTMLButtonElement>(null);

    // Mock user data
    const userName = "Student User";
    const userRole = "Student";
    const userInitial = userName.charAt(0).toUpperCase();

    // Mock notifications
    const notifications = [
        { id: 1, title: 'Live Class Reminder', desc: 'React Advanced Patterns starts in 15 mins.', time: '10m ago', unread: true },
        { id: 2, title: 'Assignment Due', desc: 'Submit "UI Design Principles" by tonight.', time: '2h ago', unread: true },
        { id: 3, title: 'Course Update', desc: 'New lessons added to "Full Stack Dev".', time: '1d ago', unread: false },
    ];

    // Calculate unread count
    const unreadCount = notifications.filter(n => n.unread).length;

    // Handle click outside to close dropdown
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
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="top-nav-bar">
            {/* Left Side: Toggle & Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>

                {/* Sidebar Toggle Button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="sidebar-toggle-btn"
                    title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    aria-label="Toggle Sidebar"
                    style={{ marginRight: '-0.5rem' }}
                >
                    <Menu size={24} strokeWidth={2} />
                </button>

                {/* Spacer to push actions to right */}
                <div style={{ flex: 1 }}></div>
            </div>

            {/* Actions: Notification & Profile */}
            <div className="top-nav-actions">

                {/* Notifications Wrapper for relative positioning */}
                <div style={{ position: 'relative' }}>
                    <button
                        ref={bellBtnRef}
                        className={`notifications-btn ${showNotifications ? 'active' : ''}`}
                        title="Notifications"
                        onClick={() => setShowNotifications(!showNotifications)}
                        aria-label="Notifications"
                        aria-expanded={showNotifications}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && <div className="notification-dot active"></div>}
                    </button>

                    {/* Notification Dropdown Panel */}
                    {showNotifications && (
                        <div className="notifications-dropdown" ref={notificationRef}>
                            <div className="notification-header">
                                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>Notifications</span>
                                <button style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                                    Mark all read
                                </button>
                            </div>
                            <div className="notification-list">
                                {notifications.length > 0 ? (
                                    notifications.map(notification => (
                                        <div key={notification.id} className={`notification-item ${notification.unread ? 'unread' : ''}`}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>{notification.title}</h4>
                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={10} /> {notification.time}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>{notification.desc}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                            <CheckCheck size={24} opacity={0.5} />
                                        </div>
                                        No new notifications
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '0.75rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                                <button style={{ width: '100%', fontSize: '0.8rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                                    View All History
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="user-pill" title="Profile Settings">
                    <div className="user-avatar-small">
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

export default Topbar;
