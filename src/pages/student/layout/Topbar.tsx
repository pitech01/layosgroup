import { useState } from 'react';
import {
    Search,
    Bell,
    ChevronDown,
    Menu,
    X,
    MessageSquare,
    BookOpen,
    Clock,
    Command
} from 'lucide-react';

interface TopbarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const Topbar = ({ collapsed, onToggle }: TopbarProps) => {
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    return (
        <header className="top-nav-bar">
            {/* Left side: Search & Toggle */}
            <div className="top-nav-left">
                <button
                    className={`sidebar-toggle-btn ${!collapsed ? 'is-active' : ''}`}
                    onClick={onToggle}
                    aria-label="Toggle Sidebar"
                >
                    {collapsed ? <Menu size={20} /> : <X size={20} />}
                </button>

                <div className="search-wrapper">
                    <div className="search-icon-box">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for courses, lessons..."
                        className="search-input-premium"
                    />
                    <div className="search-hint">
                        <Command size={12} />
                        <span>K</span>
                    </div>
                </div>
            </div>

            {/* Right side: Actions & Profile */}
            <div className="top-nav-right">
                <div className="action-buttons-group">
                    <button className="icon-action-btn" title="Messages">
                        <MessageSquare size={20} />
                        <span className="btn-indicator"></span>
                    </button>

                    <div className="notification-wrapper">
                        <button
                            className={`icon-action-btn ${notificationsOpen ? 'is-active' : ''}`}
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            title="Notifications"
                        >
                            <Bell size={20} />
                            <span className="btn-indicator pulse"></span>
                        </button>

                        {notificationsOpen && (
                            <div className="notifications-dropdown-premium">
                                <div className="notif-header">
                                    <h3>Notifications</h3>
                                    <button className="mark-read-btn">Mark all as read</button>
                                </div>
                                <div className="notif-scroll-area">
                                    <div className="notif-item-new">
                                        <div className="notif-icon-box blue">
                                            <BookOpen size={18} />
                                        </div>
                                        <div className="notif-content">
                                            <p className="notif-title">New lesson uploaded</p>
                                            <p className="notif-text">React Patterns: Module 4 is now live</p>
                                            <span className="notif-time">2 minutes ago</span>
                                        </div>
                                        <div className="notif-unread-dot"></div>
                                    </div>
                                    <div className="notif-item-new">
                                        <div className="notif-icon-box purple">
                                            <Clock size={18} />
                                        </div>
                                        <div className="notif-content">
                                            <p className="notif-title">Class starts in 30min</p>
                                            <p className="notif-text">Advanced Design Systems live session</p>
                                            <span className="notif-time">1 hour ago</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="view-all-notif-btn">View All Notifications</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="nav-divider-vertical"></div>

                <div className="user-profile-section">
                    <div className="user-profile-pill">
                        <div className="user-avatar-small">
                            AS
                        </div>
                        <div className="user-info-text">
                            <span className="user-name">Anna Student</span>
                        </div>
                        <ChevronDown size={14} className="dropdown-arrow" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
