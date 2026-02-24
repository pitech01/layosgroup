import { useState, useRef, useEffect } from 'react';
import { Bell, Clock, CheckCircle2 } from 'lucide-react';

interface Notification {
    id: number;
    title: string;
    desc: string;
    time: string;
    unread: boolean;
    type?: 'info' | 'success' | 'warning';
}

interface NotificationIconProps {
    role: 'instructor' | 'student';
}

const NotificationIcon = ({ role }: NotificationIconProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const instructorNotifications: Notification[] = [
        { id: 1, title: 'New Student Enrolled', desc: 'Alex Johnson joined "Frontend Dev Bootcamp".', time: '5m ago', unread: true },
        { id: 2, title: 'Live Class Reminder', desc: 'Your session "Advanced React" starts in 30 mins.', time: '1h ago', unread: true },
        { id: 3, title: 'Review Received', desc: 'New 5-star review for "UI/UX Design".', time: '1d ago', unread: false },
    ];

    const studentNotifications: Notification[] = [
        { id: 1, title: 'New Lesson Uploaded', desc: 'React Patterns: Module 4 is now live.', time: '2m ago', unread: true },
        { id: 2, title: 'Class Starts Soon', desc: 'Advanced Design Systems live session in 30min.', time: '1h ago', unread: true },
        { id: 3, title: 'Assignment Graded', desc: 'Your "Portfolio Project" was graded: A+.', time: '2d ago', unread: false },
    ];

    const notifications = role === 'instructor' ? instructorNotifications : studentNotifications;
    const unreadCount = notifications.filter(n => n.unread).length;

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
            <button
                ref={buttonRef}
                className={`icon-action-btn ${isOpen ? 'is-active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Notifications"
            >
                <Bell size={20} strokeWidth={2.5} />
                {unreadCount > 0 && <span className="btn-indicator" style={{ top: '10px', right: '10px' }}></span>}
            </button>

            {isOpen && (
                <div className="notifications-dropdown-premium" ref={dropdownRef} style={{ right: '-10px', top: '50px' }}>
                    <div className="notif-header">
                        <h3>Notifications</h3>
                        <button className="mark-read-btn">
                            <CheckCircle2 size={14} style={{ marginRight: '4px' }} />
                            Mark all read
                        </button>
                    </div>
                    <div className="notif-scroll-area">
                        {notifications.map((notif) => (
                            <div key={notif.id} className={`notif-item-new ${notif.unread ? 'unread' : ''}`}>
                                <div className={`notif-icon-box ${notif.unread ? 'blue' : 'gray'}`}>
                                    <Bell size={18} />
                                </div>
                                <div className="notif-content">
                                    <p className="notif-title">{notif.title}</p>
                                    <p className="notif-text">{notif.desc}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                        <Clock size={12} color="#94a3b8" />
                                        <span className="notif-time">{notif.time}</span>
                                    </div>
                                </div>
                                {notif.unread && <div className="notif-unread-dot"></div>}
                            </div>
                        ))}
                    </div>
                    <button className="view-all-notif-btn">View All Notifications</button>
                </div>
            )}
        </div>
    );
};

export default NotificationIcon;
