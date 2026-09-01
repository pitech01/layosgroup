import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import InstructorSidebar from '../../pages/instructor/layout/InstructorSidebar';
import TopbarLeft from '../layout/TopbarLeft';
import ThemeToggle from '../common/ThemeToggle';
import AdminQuickSearch from '../admin/AdminQuickSearch';
import { useAuth } from '../../context/AuthContext';
import './staff.css';

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/admin-login');
    };

    const pageTitle = location.pathname === '/admin-dashboard' ? 'Platform Overview' : 'Admin Console';

    return (
        <div className={`dashboard-layout admin-mode ${mobileOpen ? 'sidebar-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <InstructorSidebar collapsed={collapsed} mobileOpen={mobileOpen} />

            <div className="main-content-wrapper">
                <header className="top-nav-bar">
                    <TopbarLeft
                        collapsed={window.innerWidth <= 1024 ? !mobileOpen : collapsed}
                        onToggle={() => {
                            if (window.innerWidth <= 1024) {
                                setMobileOpen(!mobileOpen);
                            } else {
                                setCollapsed(!collapsed);
                            }
                        }}
                        title={pageTitle}
                        subtitle="Full administrative access"
                        icon={<ShieldCheck size={20} strokeWidth={2.5} />}
                        onSearchClick={() => setSearchOpen(true)}
                    />

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div className="user-profile-pill" style={{ cursor: 'default' }}>
                            <div className="user-avatar-small" style={{ background: 'var(--lgl-error)' }}>
                                {(user?.name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info-text">
                                <span className="user-name">{user?.name || 'Administrator'}</span>
                                <span className="user-role">Administrator</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                title="Logout"
                                aria-label="Logout"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--index-text-secondary)', display: 'flex', marginLeft: '0.5rem' }}
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="main-content staff-scope staff-scope-2">
                    <div className="animate-fade-in-up">
                        <Outlet />
                    </div>
                </main>
            </div>

            {mobileOpen && (
                <div
                    className="sidebar-mobile-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <AdminQuickSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
};

export default AdminLayout;
