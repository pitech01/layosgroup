import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import InstructorSidebar from '../../pages/instructor/layout/InstructorSidebar';
import Topbar from '../../components/layout/Topbar';

const InstructorLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

    return (
        <div className={`dashboard-layout ${mobileOpen ? 'sidebar-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <InstructorSidebar collapsed={collapsed} mobileOpen={mobileOpen} />

            <div className="main-content-wrapper">
                <Topbar
                    role="instructor"
                    collapsed={window.innerWidth <= 1024 ? !mobileOpen : collapsed}
                    onToggle={() => {
                        if (window.innerWidth <= 1024) {
                            setMobileOpen(!mobileOpen);
                        } else {
                            setCollapsed(!collapsed);
                        }
                    }}
                />

                <main className="main-content">
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
        </div>
    );
};

export default InstructorLayout;
