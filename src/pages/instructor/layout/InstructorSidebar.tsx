import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { pageKeyForPath } from '../../../constants/pageAccess';
import {
    Mic2,
    LayoutDashboard,
    Users,
    BookOpen,
    GraduationCap,
    LogOut,
    Settings,
    Video,
    MessageCircle,
    ClipboardList,
    Activity,
    Star,
    Megaphone,
    Award,
    ChevronDown,
    UserCog,
    ShieldCheck,
    Sparkles
} from 'lucide-react';

interface InstructorSidebarProps {
    collapsed: boolean;
    mobileOpen?: boolean;
}

interface NavChild {
    path: string;
    label: string;
}

interface NavEntry {
    path?: string;
    label: string;
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>;
    badge?: string;
    badgeColor?: string;
    children?: NavChild[];
}

interface NavSection {
    title?: string;
    items: NavEntry[];
}

const InstructorSidebar = ({ collapsed, mobileOpen }: InstructorSidebarProps) => {
    const { user, logout, userRole, hasPageAccess } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedGroup, setExpandedGroup] = useState<string | null>('Certificates');

    const isAdmin = userRole === 'admin';
    const userName = user?.name || (isAdmin ? 'Administrator' : 'Instructor');
    const userRoleTitle = isAdmin ? 'Super Admin' : 'Lead Instructor';
    const userInitial = userName.charAt(0).toUpperCase();

    const handleLogout = () => {
        logout();
        navigate(isAdmin ? '/admin-login' : '/instructor-login');
    };

    const isActive = (path: string) => {
        if (path === '/instructor-dashboard' || path === '/admin-dashboard') {
            return location.pathname === path ? 'active' : '';
        }
        return location.pathname.startsWith(path) ? 'active' : '';
    };

    const dashboardEntry: NavEntry = isAdmin
        ? { path: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard }
        : { path: '/instructor-dashboard', label: 'Dashboard', icon: LayoutDashboard };

    // Section 1: Academic & Management
    const academicSection: NavSection = {
        title: 'Academic & Courses',
        items: [
            dashboardEntry,
            { path: '/instructor/cohorts', label: 'Cohorts', icon: Users },
            { path: '/instructor/course-library', label: 'Courses', icon: BookOpen },
            { path: '/instructor/students', label: 'Students', icon: GraduationCap },
            {
                label: 'Certificates',
                icon: Award,
                children: [
                    { path: '/instructor/certificates/design', label: 'Design Template' },
                    { path: '/instructor/certificates/assign', label: 'Assign Certificate' },
                ],
            },
            { path: '/instructor/assignments', label: 'Assignments', icon: ClipboardList },
        ]
    };

    // Section 2: Engagement & Live Tools
    const engagementSection: NavSection = {
        title: 'Live & Communication',
        items: [
            { path: '/instructor/live', label: 'Live Classes', icon: Video, badge: 'LIVE', badgeColor: 'var(--lgl-error)' },
            { path: '/instructor/channels', label: 'Channels', icon: MessageCircle },
            { path: '/instructor/interview', label: 'Interview', icon: Mic2 },
            { path: '/instructor/reviews', label: 'Reviews', icon: Star },
            { path: '/instructor/announcements', label: 'Announcements', icon: Megaphone },
        ]
    };

    // Section 3: System & Administration
    const systemSection: NavSection = {
        title: 'System & Preferences',
        items: [
            { path: '/instructor/activity-logs', label: 'Activity Logs', icon: Activity },
            { path: '/instructor/settings', label: 'Settings', icon: Settings },
            ...(isAdmin ? [
                { path: '/admin/instructors', label: 'Manage Instructors', icon: UserCog },
                { path: '/admin/users', label: 'Users & Permissions', icon: ShieldCheck },
            ] : [])
        ]
    };

    const filterSection = (section: NavSection): NavSection => {
        const filteredItems = section.items.filter((item) => {
            const checkPath = item.path ?? item.children?.[0]?.path ?? '';
            const pageKey = pageKeyForPath(checkPath);
            return hasPageAccess(pageKey);
        });
        return { ...section, items: filteredItems };
    };

    const sections: NavSection[] = [
        filterSection(academicSection),
        filterSection(engagementSection),
        filterSection(systemSection),
    ].filter(s => s.items.length > 0);

    return (
        <aside className={`sidebar-modern instructor-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
            {/* Sidebar Brand Header */}
            <div className="sidebar-brand-wrapper">
                <Link to={isAdmin ? '/admin-dashboard' : '/instructor-dashboard'} className="sidebar-brand-link">
                    <div className="sidebar-brand-logo-box">
                        <img
                            src="/logo-v2.png"
                            alt="LGL Logo"
                            className="sidebar-brand-img"
                        />
                    </div>
                </Link>
            </div>

            {/* Navigation Menu */}
            <nav className="nav-menu">
                {sections.map((section, sIdx) => (
                    <div key={sIdx} className="nav-section-group">
                        {section.title && !collapsed && (
                            <div className="nav-section-heading">
                                <span>{section.title}</span>
                            </div>
                        )}
                        {collapsed && sIdx > 0 && <div className="nav-section-divider-collapsed" />}

                        <div className="nav-section-items">
                            {section.items.map((item) => {
                                if (item.children) {
                                    const groupActive = item.children.some((c) => location.pathname.startsWith(c.path));
                                    const isOpen = collapsed ? groupActive : (expandedGroup === item.label || groupActive);
                                    return (
                                        <div key={item.label} className="nav-accordion-item">
                                            <button
                                                type="button"
                                                className={`nav-item instructor-nav-item ${groupActive ? 'active' : ''}`}
                                                style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', justifyContent: collapsed ? 'center' : 'space-between' }}
                                                onClick={() => setExpandedGroup(isOpen ? null : item.label)}
                                                title={collapsed ? item.label : ''}
                                            >
                                                <div className="nav-item-indicator instructor-indicator" />
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                    <item.icon size={20} style={{ flexShrink: 0 }} />
                                                    {!collapsed && <span className="nav-item-label">{item.label}</span>}
                                                </div>
                                                {!collapsed && (
                                                    <ChevronDown
                                                        size={15}
                                                        className="nav-chevron-icon"
                                                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                                    />
                                                )}
                                            </button>
                                            {isOpen && !collapsed && (
                                                <div className="nav-submenu-container">
                                                    {item.children.map((child) => (
                                                        <Link
                                                            key={child.path}
                                                            to={child.path}
                                                            className={`nav-submenu-item ${isActive(child.path)}`}
                                                        >
                                                            <div className="submenu-dot" />
                                                            <span>{child.label}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path!}
                                        className={`nav-item instructor-nav-item ${isActive(item.path!)}`}
                                        title={collapsed ? item.label : ""}
                                    >
                                        <div className="nav-item-indicator instructor-indicator" />
                                        <item.icon size={20} style={{ flexShrink: 0 }} />
                                        {!collapsed && <span className="nav-item-label">{item.label}</span>}
                                        {!collapsed && item.badge && (
                                            <span
                                                className="nav-item-badge"
                                                style={{ backgroundColor: item.badgeColor || 'var(--index-primary-color)' }}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Sidebar Instructor Profile & Logout Footer */}
            <div className="sidebar-footer-enhanced">
                {!collapsed ? (
                    <div className="sidebar-user-pill">
                        <div className="sidebar-user-avatar">
                            {userInitial}
                            <span className="sidebar-online-indicator" />
                        </div>
                        <div className="sidebar-user-meta">
                            <span className="sidebar-user-name" title={userName}>{userName}</span>
                            <span className="sidebar-user-role">{userRoleTitle}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="sidebar-logout-icon-btn"
                            title="Sign Out"
                            aria-label="Sign Out"
                        >
                            <LogOut size={17} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="sidebar-collapsed-logout"
                        title="Logout"
                        aria-label="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                )}
            </div>
        </aside>
    );
};

export default InstructorSidebar;
