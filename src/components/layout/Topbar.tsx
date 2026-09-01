import { useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Video, User, Hash } from 'lucide-react';
import TopbarLeft from './TopbarLeft';
import TopbarRight from './TopbarRight';
import ThemeToggle from '../common/ThemeToggle';

interface TopbarProps {
    role: 'instructor' | 'student' | 'admin';
    collapsed: boolean;
    onToggle: () => void;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    className?: string;
    onSearchClick?: () => void;
}

const Topbar = ({ role, collapsed, onToggle, title, subtitle, icon, className, onSearchClick }: TopbarProps) => {
    const location = useLocation();

    // Derive title from route if not provided
    const getPageContext = () => {
        if (title) return { title, subtitle, icon };

        const path = location.pathname;

        if (path.includes('dashboard')) {
            return {
                title: role === 'admin' ? 'Admin Dashboard' : role === 'instructor' ? 'Instructor Dashboard' : 'Student Dashboard',
                subtitle: role === 'admin' ? 'Full platform administration' : role === 'instructor' ? 'Manage your courses and students' : 'Overview of your learning progress',
                icon: <LayoutDashboard size={20} strokeWidth={2.5} />
            };
        }
        if (path.includes('courses')) {
            return {
                title: 'My Courses',
                subtitle: 'Manage and view your educational content',
                icon: <BookOpen size={20} strokeWidth={2.5} />
            };
        }
        if (path.includes('channel')) {
            return {
                title: 'Course Channel',
                subtitle: 'Communicate with your class',
                icon: <Hash size={20} strokeWidth={2.5} />
            };
        }
        if (path.includes('live')) {
            return {
                title: 'Live Sessions',
                subtitle: 'Join interactive real-time classes',
                icon: <Video size={20} strokeWidth={2.5} />
            };
        }
        if (path.includes('account') || path.includes('settings')) {
            return {
                title: 'Account Settings',
                subtitle: 'Manage your profile and security',
                icon: <User size={20} strokeWidth={2.5} />
            };
        }

        return {
            title: role === 'admin' ? 'Admin Console' : role === 'instructor' ? 'Instructor Portal' : 'Student Portal',
            subtitle: 'Welcome back to LGL Consulting',
            icon: <LayoutDashboard size={20} strokeWidth={2.5} />
        };
    };

    const context = getPageContext();

    return (
        <header className={`top-nav-bar ${className || ''}`}>
            <TopbarLeft
                collapsed={collapsed}
                onToggle={onToggle}
                title={context.title}
                subtitle={context.subtitle}
                icon={context.icon}
                onSearchClick={onSearchClick}
            />

            <div className="top-nav-right-actions">
                <ThemeToggle />
                <TopbarRight role={role} />
            </div>
        </header>
    );
};

export default Topbar;
