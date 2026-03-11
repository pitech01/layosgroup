import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from '../../../components/layout/Topbar';

const StudentLayout = () => {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

    return (
        <div className={`student-layout dashboard-layout ${mobileOpen ? 'sidebar-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} />

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

export default StudentLayout;
