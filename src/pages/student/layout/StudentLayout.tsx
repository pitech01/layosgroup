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
        <div className="flex min-h-screen bg-brand-beige dark:bg-brand-charcoal overflow-hidden">
            <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
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

                <main className="flex-1 overflow-y-auto scrollbar-none p-4 md:p-8">
                    <div className="animate-fade-in-up">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45] animate-in fade-in duration-300 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </div>
    );
};

export default StudentLayout;
