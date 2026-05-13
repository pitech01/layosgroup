import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Video, MessageCircle, ClipboardList } from 'lucide-react';

const navItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/student/dashboard', exact: true },
    { icon: BookOpen, label: 'Courses', path: '/student/courses', exact: false },
    { icon: Video, label: 'Live', path: '/student/live', exact: false },
    { icon: MessageCircle, label: 'Chat', path: '/student/channels', exact: false },
    { icon: ClipboardList, label: 'Tasks', path: '/student/assignments', exact: false },
];

export default function MobileBottomNav() {
    const location = useLocation();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700/80 safe-area-pb">
            <div className="flex items-center justify-around h-16 px-1">
                {navItems.map(({ icon: Icon, label, path, exact }) => {
                    const isActive = exact
                        ? location.pathname === path
                        : location.pathname.startsWith(path);

                    return (
                        <Link
                            key={path}
                            to={path}
                            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-200 min-w-[56px] ${
                                isActive
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                                isActive ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''
                            }`}>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-semibold tracking-wide transition-all duration-200 ${
                                isActive ? 'opacity-100' : 'opacity-70'
                            }`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
