import { Menu, X, Search } from 'lucide-react';

interface TopbarLeftProps {
    collapsed: boolean;
    onToggle: () => void;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
}

const TopbarLeft = ({ collapsed, onToggle, title, subtitle, icon }: TopbarLeftProps) => {
    return (
        <div className="top-nav-left">
            <button
                className={`sidebar-toggle-btn ${!collapsed ? 'is-active' : ''}`}
                onClick={onToggle}
                aria-label="Toggle Sidebar"
            >
                {collapsed ? <Menu size={20} /> : <X size={20} />}
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
                        <button className="top-nav-search-trigger" aria-label="Quick Search">
                            <Search size={18} strokeWidth={2.5} />
                        </button>
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
