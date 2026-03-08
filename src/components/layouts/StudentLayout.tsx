import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Video,
    Calendar,
    User,
    LogOut,
    Settings
} from 'lucide-react';
import Topbar from '../../components/layout/Topbar';

const StudentLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Default to collapsed for a cleaner initial look
    const [collapsed, setCollapsed] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

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
        <div className={`student-layout ${mobileOpen ? 'mobile-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <style>{`
                .student-layout {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f8fafc;
                    transition: all 0.3s ease;
                }

                .student-sidebar-slim {
                    width: 260px;
                    background: #ffffff;
                    border-right: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    z-index: 1001;
                    padding: 2rem 1.25rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    flex-shrink: 0;
                }

                .sidebar-collapsed .student-sidebar-slim {
                    width: 90px;
                }

                .sidebar-logo-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 2.5rem;
                    height: 40px;
                }

                .sidebar-icon-btn {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.875rem 1rem;
                    border-radius: 12px;
                    color: #64748b;
                    text-decoration: none;
                    transition: all 0.2s;
                    font-weight: 500;
                    border: none;
                    background: transparent;
                    width: 100%;
                }

                .sidebar-icon-btn:hover {
                    background-color: #f1f5f9;
                    color: #0f172a;
                    transform: translateX(4px);
                }

                .sidebar-icon-btn.active {
                    background-color: #eff6ff;
                    color: #3b82f6;
                    font-weight: 600;
                }

                .sidebar-collapsed .sidebar-icon-btn {
                    justify-content: center;
                    padding: 0.875rem 0;
                }

                .sidebar-collapsed .sidebar-icon-btn span {
                    display: none;
                }

                .sidebar-collapsed .sidebar-icon-btn:hover {
                    transform: none;
                }

                .main-content-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow: hidden;
                    width: 100%;
                }

                .dashboard-scroll-area {
                    flex: 1;
                    overflow-y: auto;
                    padding: 2rem;
                }

                .mobile-overlay-student {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(4px);
                    z-index: 1000;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @media (max-width: 1024px) {
                    .student-sidebar-slim {
                        position: fixed;
                        left: -280px;
                        box-shadow: 10px 0 30px rgba(0, 0, 0, 0.05);
                    }

                    .mobile-open .student-sidebar-slim {
                        left: 0;
                        width: 280px;
                    }

                    .mobile-open .mobile-overlay-student {
                        display: block;
                        opacity: 1;
                        pointer-events: auto;
                    }

                    .sidebar-collapsed .student-sidebar-slim {
                        width: 260px;
                        left: -280px;
                    }

                    .mobile-open .sidebar-collapsed .student-sidebar-slim {
                        left: 0;
                    }
                }

                @media (max-width: 640px) {
                    .dashboard-scroll-area {
                        padding: 1rem;
                    }
                    .mobile-open .student-sidebar-slim {
                        width: 85%;
                        max-width: 300px;
                    }
                }
            `}</style>

            <div className="mobile-overlay-student" onClick={() => setMobileOpen(false)} />

            {/* Sidebar */}
            <aside className="student-sidebar-slim">
                <div className="sidebar-logo-container">
                    <img src="/logo.png" alt="Logo" style={{ width: '40px', height: 'auto' }} />
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Link to="/student-dashboard" className={`sidebar-icon-btn ${isActive('/student-dashboard')}`} title="Dashboard">
                        <LayoutDashboard size={22} />
                        {!collapsed && <span>Dashboard</span>}
                    </Link>
                    <Link to="/student/courses" className={`sidebar-icon-btn ${isActive('/student/courses')}`} title="My Courses">
                        <BookOpen size={22} />
                        {!collapsed && <span>My Courses</span>}
                    </Link>
                    <Link to="/student/live" className={`sidebar-icon-btn ${isActive('/student/live')}`} title="Live & Recorded">
                        <Video size={22} />
                        {!collapsed && <span>Live Sessions</span>}
                    </Link>
                    <Link to="#" className="sidebar-icon-btn" title="Assignments">
                        <Calendar size={22} />
                        {!collapsed && <span>Assignments</span>}
                    </Link>
                    <Link to="/student/account" className={`sidebar-icon-btn ${isActive('/student/account')}`} title="Profile">
                        <User size={22} />
                        {!collapsed && <span>Profile</span>}
                    </Link>
                </nav>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Link to="/student/account" className={`sidebar-icon-btn ${isActive('/student/account')}`} title="Settings">
                        <Settings size={22} />
                        {!collapsed && <span>Settings</span>}
                    </Link>
                    <button onClick={handleLogout} className="sidebar-icon-btn" title="Logout" style={{ color: '#ef4444' }}>
                        <LogOut size={22} />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="main-content-wrapper">
                <Topbar
                    role="student"
                    collapsed={window.innerWidth <= 1024 ? !mobileOpen : collapsed}
                    onToggle={() => {
                        if (window.innerWidth <= 1024) {
                            setMobileOpen(!mobileOpen);
                        } else {
                            setCollapsed(!collapsed);
                        }
                    }}
                />

                {/* Content Area */}
                <main className="dashboard-scroll-area">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
