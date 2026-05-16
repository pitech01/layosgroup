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
} from 'lucide-react';

interface SidebarProps {
    collapsed: boolean;
    mobileOpen?: boolean;
}

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard', exact: true },
    { icon: BookOpen, label: 'Courses', path: '/student/courses', exact: false },
    { icon: Video, label: 'Live Sessions', path: '/student/live', exact: false },
    { icon: MessageCircle, label: 'Channels', path: '/student/channels', exact: false },
    { icon: ClipboardList, label: 'Assignments', path: '/student/assignments', exact: false },
    { icon: Mic2, label: 'Interview', path: '/student/interview', exact: false },
    { icon: User, label: 'Account', path: '/student/account', exact: false },
];

const Sidebar = ({ collapsed, mobileOpen }: SidebarProps) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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
            {/* Header: Logo */}
            <div className={`flex items-center h-20 px-6 ${collapsed ? 'justify-center' : 'justify-start gap-4'}`}>
                <img
                    src="/logo.png"
                    alt="Logo"
                    className={`h-8 w-auto transition-opacity duration-200 ${collapsed ? 'opacity-0' : 'opacity-100'}`}
                />
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
