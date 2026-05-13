import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
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
    ChevronRight,
    Zap
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
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const navItems = [
        { path: '/instructor-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/instructor/cohorts', label: 'Cohorts', icon: Users },
        { path: '/instructor/course-library', label: 'Courses', icon: BookOpen },
        { path: '/instructor/students', label: 'Students', icon: GraduationCap },
        { path: '/instructor/assignments', label: 'Assignments', icon: ClipboardList },
        { path: '/instructor/interview', label: 'Interview', icon: Mic2 },
        { path: '/instructor/live', label: 'Live Classes', icon: Video },
        { path: '/instructor/channels', label: 'Channels', icon: MessageCircle },
        { path: '/instructor/activity-logs', label: 'Activity Logs', icon: Activity },
        { path: '/instructor/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className={`
            ${collapsed ? 'w-20' : 'w-80'}
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:relative z-50 h-screen transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
            bg-brand-charcoal dark:bg-black border-r border-white/5 flex flex-col shadow-2xl
        `}>
            {/* Header: Logo */}
            <div className={`flex items-center h-28 px-8 ${collapsed ? 'justify-center' : 'justify-between gap-4'}`}>
                <div className={`flex items-center gap-4 transition-all duration-500 ${collapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
                    <div className="w-10 h-10 bg-brand-emerald rounded-xl flex items-center justify-center shadow-lg shadow-brand-emerald/20">
                        <Zap className="text-white fill-current" size={20} />
                    </div>
                    <span className="font-black text-white text-xl tracking-tighter uppercase">Layos<span className="text-brand-emerald">.</span></span>
                </div>
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 overflow-y-auto py-8 px-6 space-y-3 custom-scrollbar">
                {navItems.map(({ icon: Icon, label, path }) => {
                    const active = isActive(path);
                    return (
                        <Link
                            key={path}
                            to={path}
                            className={`
                                group relative flex items-center gap-4 px-5 py-4 rounded-[22px]
                                font-black text-[11px] uppercase tracking-widest transition-all duration-300
                                ${active
                                    ? 'bg-brand-emerald text-white shadow-xl shadow-brand-emerald/20 translate-x-2'
                                    : 'text-brand-muted hover:bg-white/5 hover:text-white'
                                }
                                ${collapsed ? 'justify-center px-0' : ''}
                            `}
                        >
                            <Icon size={20} strokeWidth={active ? 3 : 2} className={`flex-shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                            {!collapsed && (
                                <span className="flex-1">{label}</span>
                            )}
                            {active && !collapsed && (
                                <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-8 mt-auto border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className={`
                        group w-full flex items-center gap-4 px-5 py-4 rounded-[22px]
                        text-[11px] font-black uppercase tracking-widest text-brand-muted hover:bg-red-500/10 hover:text-red-500
                        transition-all duration-300 border-none cursor-pointer
                        ${collapsed ? 'justify-center px-0' : ''}
                    `}
                >
                    <LogOut size={20} strokeWidth={2.5} className="flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
                    {!collapsed && <span>System Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default InstructorSidebar;
