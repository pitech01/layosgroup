import { Menu, X } from 'lucide-react';

interface TopbarLeftProps {
    collapsed: boolean;
    onToggle: () => void;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
}

const TopbarLeft = ({ collapsed, onToggle, title, subtitle, icon }: TopbarLeftProps) => {
    return (
        <div className="flex items-center gap-3">
            <button
                className={`lg:hidden p-2 rounded-lg text-brand-muted hover:bg-brand-border/50 transition-colors border-none cursor-pointer ${!collapsed ? 'text-brand-emerald bg-brand-emerald/10' : ''}`}
                onClick={onToggle}
                aria-label="Toggle Sidebar"
            >
                {collapsed ? <Menu size={24} /> : <X size={24} />}
            </button>

            <div className="flex items-center gap-3">
                {icon && (
                    <div className="hidden lg:flex p-2 bg-brand-emerald/10 text-brand-emerald rounded-xl shadow-inner">
                        {icon}
                    </div>
                )}
                <div>
                    <h1 className="text-xl lg:text-3xl font-black tracking-tight text-brand-charcoal dark:text-white truncate max-w-[160px] sm:max-w-md m-0">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="hidden lg:block text-sm font-medium text-brand-muted dark:text-slate-400 mt-1 m-0">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopbarLeft;
