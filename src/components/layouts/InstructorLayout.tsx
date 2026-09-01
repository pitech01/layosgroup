import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import InstructorSidebar from '../../pages/instructor/layout/InstructorSidebar';
import Topbar from '../../components/layout/Topbar';
import AdminQuickSearch from '../admin/AdminQuickSearch';
import { useAuth } from '../../context/AuthContext';
import './staff.css'



const InstructorLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);
    const location = useLocation();
    const { userRole } = useAuth();
    const isAdmin = userRole === 'admin';

    // Track responsive breakpoints dynamically
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);
            if (!mobile) {
                setMobileOpen(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    return (
        <div className={`dashboard-layout ${mobileOpen ? 'sidebar-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''} ${isAdmin ? 'admin-mode' : ''}`}>
            <InstructorSidebar collapsed={collapsed} mobileOpen={mobileOpen} />

            <div className="main-content-wrapper">
                {isAdmin && (
                    <div className="admin-mode-banner">
                        <ShieldCheck size={14} strokeWidth={3} />
                        <span>Admin Mode &mdash; viewing full instructor tools</span>
                    </div>
                )}

                <Topbar
                    role={isAdmin ? 'admin' : 'instructor'}
                    collapsed={isMobile ? !mobileOpen : collapsed}
                    onToggle={() => {
                        if (isMobile) {
                            setMobileOpen(prev => !prev);
                        } else {
                            setCollapsed(prev => !prev);
                        }
                    }}
                    onSearchClick={isAdmin ? () => setSearchOpen(true) : undefined}
                />

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

            {isAdmin && <AdminQuickSearch open={searchOpen} onClose={() => setSearchOpen(false)} />}
        </div>
    );
};

export default InstructorLayout;
