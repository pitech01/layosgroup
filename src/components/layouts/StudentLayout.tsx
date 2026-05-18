import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Video,
    Calendar,
    MessageCircle,
    User,
    LogOut,
    Settings
} from 'lucide-react';
import Topbar from '../../components/student_layout/Topbar';
import MobileBottomNav from '../common/MobileBottomNav';
//import '../../index.css'


const StudentLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Default to expanded on desktop, but collapsible
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        if (path === '/student/dashboard' || path === '/student-dashboard') {
            return location.pathname === '/student/dashboard' || location.pathname === '/student-dashboard';
        }
        return location.pathname.startsWith(path);
    };

    const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
        const active = isActive(to);
        return (
            <Link
                to={to}
                title={label}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${active 
                        ? 'bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)] font-semibold' 
                        : 'text-[var(--text-muted)] hover:bg-[var(--border-subtle)]/50 hover:text-[var(--text-charcoal)]'
                    }`}
            >
                <Icon size={22} className={active ? 'text-[var(--accent-emerald)]' : 'opacity-70 group-hover:opacity-100 transition-opacity'} />
                {!collapsed && <span className="truncate">{label}</span>}
            </Link>
        );
    };

    return (
        <div className="flex min-h-screen bg-[var(--bg-neutral)] text-[var(--text-charcoal)] font-sans">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] sticky top-0 h-screen transition-all duration-300 z-40 ${collapsed ? 'w-[90px]' : 'w-[280px]'} py-8 px-4`}>
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start px-2'} mb-10 h-10`}>
                    <img src="/logo.png" alt="Logo" className="w-8 h-auto flex-shrink-0" />
                    {!collapsed && <span className="ml-3 font-bold text-xl tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">LMS Portal</span>}
                </div>

                <nav className="flex flex-col gap-2 flex-1 overflow-y-auto overflow-x-hidden">
                    <NavItem to="/student/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/student/courses" icon={BookOpen} label="My Learning" />
                    <NavItem to="/student/live" icon={Video} label="Live Sessions" />
                    <NavItem to="/student/channels" icon={MessageCircle} label="Channels" />
                    <NavItem to="/student/assignments" icon={Calendar} label="Assignments" />
                    <NavItem to="/student/account" icon={User} label="Profile" />
                </nav>

                <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-[var(--border-subtle)]">
                    <NavItem to="/student/settings" icon={Settings} label="Settings" />
                    <button 
                        onClick={handleLogout} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 w-full ${collapsed ? 'justify-center' : 'justify-start'}`}
                        title="Logout"
                    >
                        <LogOut size={22} />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
                <Topbar 
                    role="student" 
                    collapsed={collapsed}
                    onToggle={() => setCollapsed(!collapsed)} 
                />
                
                <main className="flex-1 overflow-y-auto pb-24 lg:pb-0 scroll-smooth">
                    <div className="max-w-[1440px] mx-auto w-full p-4 md:p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
};

export default StudentLayout;
