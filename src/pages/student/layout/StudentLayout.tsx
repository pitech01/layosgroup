import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from '../../../components/layout/Topbar';

const StudentLayout = () => {
    const location = useLocation();
    // Start collapsed on mobile by default
    const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 1024);

    // Close mobile sidebar on route change
    useEffect(() => {
        if (window.innerWidth <= 1024) {
            setSidebarCollapsed(true);
        }
    }, [location]);

    return (
        <div className={`student-layout dashboard-layout ${!sidebarCollapsed ? 'sidebar-open' : ''}`}>
            <Sidebar collapsed={sidebarCollapsed} />

            <div className="main-content-wrapper">
                <Topbar
                    role="student"
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                <main className="main-content">
                    <div className="animate-fade-in-up">
                        <Outlet />
                    </div>
                </main>
            </div>

            {!sidebarCollapsed && window.innerWidth <= 1024 && (
                <div
                    className="sidebar-mobile-overlay"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}
        </div>
    );
};

export default StudentLayout;
