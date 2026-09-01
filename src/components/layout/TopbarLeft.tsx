import { useState, useEffect } from 'react';
import { PanelLeftClose, PanelLeft, Menu, X, Search } from 'lucide-react';

interface TopbarLeftProps {
    collapsed: boolean;
    onToggle: () => void;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    onSearchClick?: () => void;
}

const TopbarLeft = ({ collapsed, onToggle, title, subtitle, icon, onSearchClick }: TopbarLeftProps) => {
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleTitle = isMobile
        ? (collapsed ? "Open Navigation Menu" : "Close Navigation Menu")
        : (collapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)");

    return (
        <div className="top-nav-left">
            <button
                className={`sidebar-toggle-btn ${!collapsed ? 'is-active' : ''}`}
                onClick={onToggle}
                aria-label={toggleTitle}
                title={toggleTitle}
            >
                {isMobile ? (
                    collapsed ? <Menu size={20} strokeWidth={2.2} /> : <X size={20} strokeWidth={2.2} />
                ) : (
                    collapsed ? <PanelLeft size={20} strokeWidth={2.2} /> : <PanelLeftClose size={20} strokeWidth={2.2} />
                )}
            </button>

            <div className="top-nav-context-wrapper">
                {icon && (
                    <div className="top-nav-context-icon">
                        {icon}
                    </div>
                )}
                <div className="top-nav-title-container">
                    <div className="top-nav-title-row">
                        <h1 className="top-nav-page-title">
                            {title}
                        </h1>
                        {onSearchClick && (
                            <button className="top-nav-search-trigger" aria-label="Quick Search" onClick={onSearchClick}>
                                <Search size={18} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                    {subtitle && (
                        <span className="top-nav-page-subtitle">
                            {subtitle}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopbarLeft;
