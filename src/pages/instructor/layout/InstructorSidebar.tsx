import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    LayoutDashboard,
    Library,
    Users,
    Video,
    LogOut,
    MessageCircle
} from 'lucide-react';

interface InstructorSidebarProps {
    collapsed: boolean;
}

const InstructorSidebar = ({ collapsed }: InstructorSidebarProps) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/instructor-login');
    };

    const isActive = (path: string) => {
        if (path === '/instructor-dashboard') {
            return location.pathname === path ? 'active' : '';
        }
        return location.pathname.startsWith(path) ? 'active' : '';
    };

    const navItems = [
        { path: '/instructor-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/instructor/courses', label: 'My Courses', icon: Library },
        { path: '/instructor/students', label: 'Students', icon: Users },
        { path: '/instructor/channels', label: 'Messages', icon: MessageCircle },
        // { path: '/instructor/revenue', label: 'Revenue', icon: BadgeDollarSign },
        { path: '/instructor/live', label: 'Live Classes', icon: Video },
    ];

    return (
        <aside className={`sidebar-modern instructor-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <img
                    src="/logo.png"
                    alt="Logo"
                    className="sidebar-logo"
                    style={{
                        height: '32px',
                        width: 'auto',
                        opacity: collapsed ? 0 : 1,
                        transition: 'opacity 0.2s',
                        padding: '0 0.5rem'
                    }}
                />
            </div>

            <nav className="nav-menu">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item instructor-nav-item ${isActive(item.path)}`}
                        title={collapsed ? item.label : ""}
                    >
                        <div className="nav-item-indicator instructor-indicator" />
                        <item.icon size={22} style={{ flexShrink: 0 }} />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button
                    onClick={handleLogout}
                    className="logout-btn instructor-logout"
                    title={collapsed ? "Logout" : ""}
                >
                    <LogOut size={22} style={{ flexShrink: 0 }} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default InstructorSidebar;
