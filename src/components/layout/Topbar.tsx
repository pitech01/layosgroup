import { useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Video, User, Hash } from 'lucide-react';
import TopbarLeft from './TopbarLeft';
import TopbarRight from './TopbarRight';
import ThemeToggle from '../common/ThemeToggle';

interface TopbarProps {
    role: 'instructor' | 'student';
    collapsed: boolean;
    onToggle: () => void;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    className?: string;
}

const Topbar = ({ role, collapsed, onToggle, title, subtitle, icon, className }: TopbarProps) => {
    const location = useLocation();

    // Derive title from route if not provided
    const getPageContext = () => {
        if (title) return { title, subtitle, icon };

        const path = location.pathname;

        if (path.includes('dashboard')) {
            return {
                title: 'Welcome back',
                subtitle: 'Overview of your learning progress',
                icon: <LayoutDashboard size={20} />
            };
        }
        if (path.includes('courses')) {
            return {
                title: 'My Learning Journey',
                subtitle: 'Manage and view your educational content',
                icon: <BookOpen size={20} />
            };
        }
        if (path.includes('channel')) {
            return {
                title: 'Course Channel',
                subtitle: 'Communicate with your class',
                icon: <Hash size={20} />
            };
        }
        if (path.includes('live')) {
            return {
                title: 'Live Sessions',
                subtitle: 'Join interactive real-time classes',
                icon: <Video size={20} />
            };
        }
        if (path.includes('assignments')) {
            return {
                title: 'Active Assignments',
                subtitle: 'Track your tasks and deadlines',
                icon: <BookOpen size={20} />
            };
        }
        if (path.includes('account') || path.includes('settings')) {
            return {
                title: 'Account Settings',
                subtitle: 'Manage your profile and security',
                icon: <User size={20} />
            };
        }

        return {
            title: role === 'instructor' ? 'Instructor Portal' : 'Student Portal',
            subtitle: 'Welcome back to LayosGroup',
            icon: <LayoutDashboard size={20} />
        };
    };

    const context = getPageContext();

    return (
        <header className={`flex items-center justify-between px-4 lg:px-8 py-3 lg:py-5 bg-[var(--bg-neutral)] border-b border-[var(--border-subtle)] lg:border-none sticky top-0 z-30 transition-all ${className || ''}`}>
            <TopbarLeft
                collapsed={collapsed}
                onToggle={onToggle}
                title={context.title}
                subtitle={context.subtitle}
                icon={context.icon}
            />

            <div className="flex items-center gap-4">
                {/* Search Field (Desktop only) */}
                {/* <div className="hidden lg:flex items-center relative">
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="pl-10 pr-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full text-sm focus:outline-none focus:border-[var(--accent-emerald)] transition-colors w-64 shadow-sm"
                    />
                    <svg className="w-4 h-4 absolute left-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <ThemeToggle /> */}
                <TopbarRight role={role} />
            </div>
        </header>
    );
};

export default Topbar;
