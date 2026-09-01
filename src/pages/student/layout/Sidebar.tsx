import { useEffect, useState } from 'react';
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
    ClipboardList,
    GraduationCap,
    Brain,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';

interface SidebarProps {
    collapsed: boolean;
    mobileOpen?: boolean;
    onToggle?: () => void;
}

const baseNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard', exact: true },
    { icon: BookOpen, label: 'Courses', path: '/student/courses', exact: false },
    { icon: Video, label: 'Live Sessions', path: '/student/live', exact: false },
    { icon: MessageCircle, label: 'Channels', path: '/student/channels', exact: false },
    { icon: ClipboardList, label: 'Assignments', path: '/student/assignments', exact: false },
    { icon: Brain, label: 'General Quiz', path: '/student/quiz', exact: false },
    { icon: Mic2, label: 'Interview', path: '/student/interview', exact: false },
    { icon: User, label: 'Account', path: '/student/account', exact: false },
];

const examNavItem = { icon: GraduationCap, label: 'Examination', path: '/student/exam', exact: false };

const Sidebar = ({ collapsed, mobileOpen, onToggle }: SidebarProps) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [examEnabled, setExamEnabled] = useState(false);

    useEffect(() => {
        const checkExamAccess = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            const API_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            try {
                const response = await fetch(`${API_URL}/my-enrollments`, {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) return;
                const data = await response.json();
                const cohorts = data?.cohorts || [];
                setExamEnabled(cohorts.some((c: any) => c.exam_enabled));
            } catch {
                // Silently ignore — sidebar just won't show the exam link
            }
        };
        checkExamAccess();
    }, []);

    const navItems = examEnabled ? [...baseNavItems.slice(0, 6), examNavItem, ...baseNavItems.slice(6)] : baseNavItems;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string, exact: boolean) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <aside className={`
            ${collapsed ? 'w-20' : 'w-72'}
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:relative z-50 h-screen transition-all duration-300 ease-in-out
            bg-brand-beige dark:bg-brand-charcoal border-r border-brand-border flex flex-col
        `}>
            {/* Header: Logo + Collapse Toggle */}
            <div className={`flex items-center h-20 px-6 ${collapsed ? 'justify-center' : 'justify-between gap-4'}`}>
                {!collapsed && (
                    <div className="dark:bg-white dark:rounded-xl dark:px-3 dark:py-1.5 transition-opacity duration-200">
                        <img
                            src="/logo-v2.png"
                            alt="Logo"
                            className="h-8 w-auto"
                        />
                    </div>
                )}
                {onToggle && (
                    <button
                        onClick={onToggle}
                        aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                        className="hidden lg:flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-xl text-brand-muted hover:bg-brand-emerald/10 hover:text-brand-emerald dark:text-gray-300 transition-colors border-none cursor-pointer bg-transparent"
                    >
                        {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                    </button>
                )}
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-none ">
                {navItems.map(({ icon: Icon, label, path, exact }) => {
                    const active = isActive(path, exact);
                    return (
                        <Link
                            key={path}
                            to={path}
                            className={`
                                 flex items-center gap-4 px-4 py-3.5 rounded-2xl
                                font-black text-sm transition-all duration-200 nav-link dark:text-gray-100
                                ${active
                                    ? 'bg-brand-emerald text-white shadow-xl shadow-brand-emerald/20 translate-x-1'
                                    : ''
                                }
                                ${collapsed ? 'justify-center px-0' : ''}
                            `}
                        >
                            <Icon size={20} strokeWidth={active ? 3 : 2} className="flex-shrink-0 dark:text-gray-100" />
                            {!collapsed && <span>{label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 mt-auto">
                <button
                    onClick={handleLogout}
                    className={`
                        w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl
                        text-sm font-black text-brand-muted hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600
                        transition-all duration-200 border-none cursor-pointer
                        ${collapsed ? 'justify-center px-0' : ''}
                    `}
                >
                    <LogOut size={20} strokeWidth={2.5} className="flex-shrink-0" />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
