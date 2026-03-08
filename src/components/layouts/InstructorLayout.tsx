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
        <div className={`instructor-main-layout ${mobileOpen ? 'mobile-open' : ''}`}>
            <style>{`
                :root {
                    --inst-bg: #f8fafc;
                    --inst-sidebar-bg: #ffffff;
                    --inst-primary: #020617;
                    --inst-text-main: #1e293b;
                    --inst-text-muted: #64748b;
                    --inst-border: #e2e8f0;
                    --inst-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                }

                .instructor-main-layout, 
                .instructor-main-layout *, 
                .instructor-main-layout *::before, 
                .instructor-main-layout *::after {
                    box-sizing: border-box;
                }

                .instructor-main-layout {
                    display: flex;
                    min-height: 100vh;
                    background-color: var(--inst-bg);
                    color: var(--inst-text-main);
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    position: relative;
                }

                 .instructor-sidebar {
                    background: var(--inst-sidebar-bg) !important;
                    border-right: 1px solid var(--inst-border) !important;
                    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.02) !important;
                    z-index: 1001;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    flex-shrink: 0;
                    height: 100vh !important;
                    position: sticky !important;
                    top: 0 !important;
                    overflow-y: auto !important;
                    scrollbar-width: thin;
                }

                .instructor-nav-item {
                    color: var(--inst-text-muted) !important;
                    transition: all 0.2s ease !important;
                    padding: 0.75rem 1rem !important;
                    border-radius: 10px !important;
                    margin: 0.25rem 0.75rem !important;
                    font-weight: 500 !important;
                    font-size: 0.9375rem !important;
                }

                .instructor-nav-item:hover {
                    background-color: #f1f5f9 !important;
                    color: var(--inst-primary) !important;
                }

                .instructor-nav-item.active {
                    background-color: #f1f5f9 !important;
                    color: var(--inst-primary) !important;
                    font-weight: 600 !important;
                }
                
                .instructor-nav-item.active .instructor-indicator {
                    background-color: var(--inst-primary) !important;
                }

                .instructor-content-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                    overflow-x: hidden; /* Prevent horizontal scroll on this wrapper */
                }

                .instructor-content-area {
                    flex: 1;
                    padding: 2.5rem;
                    width: 100%;
                }

                .sidebar-overlay {
                    display: none;
                }

                @media (max-width: 1024px) {
                    .instructor-sidebar {
                        position: fixed !important;
                        left: -280px !important;
                        width: 280px !important;
                        height: 100vh !important;
                    }
                    .mobile-open .instructor-sidebar {
                        left: 0 !important;
                    }
                    .sidebar-overlay {
                        display: block;
                        position: fixed;
                        inset: 0;
                        background: rgba(15, 23, 42, 0.3);
                        backdrop-filter: blur(4px);
                        z-index: 1000;
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity 0.3s ease;
                    }
                    .mobile-open .sidebar-overlay {
                        opacity: 1;
                        pointer-events: auto;
                    }
                    .instructor-top-nav {
                        padding: 0 1rem !important;
                    }
                    .instructor-content-area {
                        padding: 1.25rem !important;
                    }
                }

                /* Standard Glass/Panel Overrides */
                .glass-panel {
                    background: #ffffff !important;
                    border: 1px solid var(--inst-border) !important;
                    border-radius: 16px !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
                    backdrop-filter: none !important;
                }

                .btn-standard {
                    background-color: var(--inst-primary);
                    color: white;
                    padding: 0.65rem 1.25rem;
                    border-radius: 10px;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    white-space: nowrap;
                    font-size: 0.9rem;
                }
                
                .btn-standard:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(26, 77, 62, 0.2);
                }

                @media (max-width: 640px) {
                    .instructor-top-nav .user-info-text {
                        display: none;
                    }
                    
                    .instructor-content-area {
                        padding: 1rem !important;
                    }

                    .instructor-sidebar {
                        width: 100% !important;
                        left: -100% !important;
                    }
                    
                    .mobile-open .instructor-sidebar {
                        left: 0 !important;
                        width: 85% !important; /* Don't cover fully to show overlay hint */
                        max-width: 300px;
                    }
                }

                /* Ensure long names or titles wrap or truncate properly */
                .top-nav-page-title {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 150px;
                }

                @media (min-width: 641px) and (max-width: 1024px) {
                    .top-nav-page-title {
                        max-width: 300px;
                    }
                }
            `}</style>

            <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />

            <InstructorSidebar collapsed={collapsed} />

            <div className="instructor-content-wrapper">
                <Topbar
                    role="instructor"
                    className="instructor-top-nav"
                    collapsed={window.innerWidth <= 1024 ? !mobileOpen : collapsed}
                    onToggle={() => {
                        if (window.innerWidth <= 1024) {
                            setMobileOpen(!mobileOpen);
                        } else {
                            setCollapsed(!collapsed);
                        }
                    }}
                />

                <main className="instructor-content-area">
                    <div className="animate-fade-in-up">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default InstructorLayout;
