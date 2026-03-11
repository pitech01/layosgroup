import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    GraduationCap,
    LogOut,
    Settings,
    Video,
    MessageCircle,
    ClipboardList
} from 'lucide-react';

interface InstructorSidebarProps {
    collapsed: boolean;
    mobileOpen?: boolean;
}

const InstructorSidebar = ({ collapsed, mobileOpen }: InstructorSidebarProps) => {
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
        { path: '/instructor/cohorts', label: 'Cohorts', icon: Users },
        { path: '/instructor/course-library', label: 'Courses', icon: BookOpen },
        { path: '/instructor/students', label: 'Students', icon: GraduationCap },
        { path: '/instructor/assignments', label: 'Assignments', icon: ClipboardList },
        { path: '/instructor/live', label: 'Live Classes', icon: Video },
        { path: '/instructor/channels', label: 'Channels', icon: MessageCircle },
        { path: '/instructor/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className={`sidebar-modern instructor-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`} style={{ overflowY: 'auto' }}>
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
