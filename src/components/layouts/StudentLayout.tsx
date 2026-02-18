import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Video,
    Calendar,
    User,
    LogOut,
    Search,
    Bell,
    Settings
} from 'lucide-react';

const StudentLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };


    const isActive = (path: string) => {
        if (path === '/student-dashboard') {
            return location.pathname === path ? 'active' : '';
        }
        return location.pathname.startsWith(path) ? 'active' : '';
    };

    return (
        <div className="student-layout">
            {/* Slim Sidebar */}
            <aside className="student-sidebar-slim">
                <div className="sidebar-logo-container" style={{ marginBottom: '1rem' }}>
                    <img src="/logo.png" alt="Logo" style={{ width: '40px', height: 'auto' }} />
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link to="/student-dashboard" className={`sidebar-icon-btn ${isActive('/student-dashboard')}`} title="Dashboard">
                        <LayoutDashboard size={22} />
                    </Link>
                    <Link to="/student/courses" className={`sidebar-icon-btn ${isActive('/student/courses')}`} title="My Courses">
                        <BookOpen size={22} />
                    </Link>
                    <Link to="/student/live" className={`sidebar-icon-btn ${isActive('/student/live')}`} title="Live & Recorded">
                        <Video size={22} />
                    </Link>
                    <Link to="#" className="sidebar-icon-btn" title="Assignments">
                        <Calendar size={22} />
                    </Link>
                    <Link to="/student/account" className={`sidebar-icon-btn ${isActive('/student/account')}`} title="Profile">
                        <User size={22} />
                    </Link>
                </nav>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link to="/student/account" className={`sidebar-icon-btn ${isActive('/student/account')}`} title="Settings">
                        <Settings size={22} />
                    </Link>
                    <button onClick={handleLogout} className="sidebar-icon-btn" title="Logout" style={{ color: '#ef4444' }}>
                        <LogOut size={22} />
                    </button>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="main-content-wrapper">
                {/* Top Nav Bar */}
                <header className="top-nav-bar">
                    <div className="search-container">
                        <Search size={18} className="search-icon" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            className="search-input-modern"
                            placeholder="Search your courses, lessons..."
                        />
                    </div>

                    <div className="top-nav-actions">
                        <div className="icon-action-btn">
                            <Bell size={22} />
                            <div className="notification-dot"></div>
                        </div>

                        <div className="user-profile-pill" style={{ paddingLeft: '0.5rem' }}>
                            <div className="avatar-circle" style={{ width: '32px', height: '32px' }}>A</div>
                            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '0.25rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Anna Student</span>
                                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Premium</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="dashboard-scroll-area">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
