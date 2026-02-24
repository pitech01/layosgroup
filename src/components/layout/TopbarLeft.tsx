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
                style={{
                    background: '#f8fafc',
                    width: '38px',
                    height: '38px'
                }}
            >
                {collapsed ? <Menu size={20} /> : <X size={20} />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {icon && (
                    <div className="top-nav-context-icon">
                        {icon}
                    </div>
                )}
                <div className="top-nav-title-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h1 className="top-nav-page-title">
                            {title}
                        </h1>
                        <button className="icon-action-btn" style={{ width: '38px', height: '38px' }}>
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
