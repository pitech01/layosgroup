import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    Mic2,
    LayoutDashboard,
    BookOpen,
    Video,
    User,
    LogOut,
    MessageCircle,
    ClipboardList
} from 'lucide-react';

interface SidebarProps {
    collapsed: boolean;
    mobileOpen?: boolean;
}

const Sidebar = ({ collapsed, mobileOpen }: SidebarProps) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        if (path === '/student/dashboard') {
            return location.pathname === path ? 'active' : '';
        }
        return location.pathname.startsWith(path) ? 'active' : '';
    };

    return (
        <aside className={`sidebar-modern ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>

            {/* Header: Logo */}
            <div className="sidebar-header">
                {/* Logo - Text or Image */}
                <img
                    src="/logo.png"
                    alt="Logo"
                    className="sidebar-logo"
                    style={{
                        height: '32px',
                        width: 'auto',
                        opacity: collapsed ? 0 : 1,
                        transition: 'opacity 0.2s',
                    }}
                />
            </div>

            {/* Navigation Menu */}
            <nav className="nav-menu">
                <Link
                    to="/student/dashboard"
                    className={`nav-item ${isActive('/student/dashboard')}`}
                    title={collapsed ? "Dashboard" : ""}
                >
                    <div className="nav-item-indicator" />
                    <LayoutDashboard size={22} style={{ flexShrink: 0 }} />
                    <span>Dashboard</span>
                </Link>

                <Link
                    to="/student/courses"
                    className={`nav-item ${isActive('/student/courses')}`}
                    title={collapsed ? "Courses" : ""}
                >
                    <div className="nav-item-indicator" />
                    <BookOpen size={22} style={{ flexShrink: 0 }} />
                    <span>Courses</span>
                </Link>

                <Link
                    to="/student/live"
                    className={`nav-item ${isActive('/student/live')}`}
                    title={collapsed ? "Live" : ""}
                >
                    <div className="nav-item-indicator" />
                    <Video size={22} style={{ flexShrink: 0 }} />
                    <span>Live Sessions</span>
                </Link>

                <Link
                    to="/student/channels"
                    className={`nav-item ${isActive('/student/channels')}`}
                    title={collapsed ? "Channels" : ""}
                >
                    <div className="nav-item-indicator" />
                    <MessageCircle size={22} style={{ flexShrink: 0 }} />
                    <span>Channels</span>
                </Link>

                <Link
                    to="/student/assignments"
                    className={`nav-item ${isActive('/student/assignments')}`}
                    title={collapsed ? "Assignments" : ""}
                >
                    <div className="nav-item-indicator" />
                    <ClipboardList size={22} style={{ flexShrink: 0 }} />
                    <span>Assignments</span>
                </Link>

                <Link
                    to="/student/interview"
                    className={`nav-item ${isActive('/student/interview')}`}
                    title={collapsed ? "Interview" : ""}
                >
                    <div className="nav-item-indicator" />
                    <Mic2 size={22} style={{ flexShrink: 0 }} />
                    <span>Interview</span>
                </Link>

                <Link
                    to="/student/account"
                    className={`nav-item ${isActive('/student/account')}`}
                    title={collapsed ? "Account" : ""}
                >
                    <div className="nav-item-indicator" />
                    <User size={22} style={{ flexShrink: 0 }} />
                    <span>Account</span>
                </Link>
            </nav>

            {/* Footer / Logout */}
            <div className="sidebar-footer">
                <button
                    onClick={handleLogout}
                    className="logout-btn"
                    title={collapsed ? "Logout" : ""}
                >
                    <LogOut size={22} style={{ flexShrink: 0 }} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
