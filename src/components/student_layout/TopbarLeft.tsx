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
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden mr-1 sm:mr-2">
            <button
                className={`lg:hidden p-2 rounded-xl text-brand-muted hover:bg-brand-border/50 transition-colors border border-transparent hover:border-brand-border flex-shrink-0 cursor-pointer ${!collapsed ? 'text-brand-emerald bg-brand-emerald/10 border-brand-emerald/20' : 'bg-white/60 dark:bg-white/5'}`}
                onClick={onToggle}
                aria-label={collapsed ? "Open Navigation Menu" : "Close Navigation Menu"}
                title={collapsed ? "Open Navigation Menu" : "Close Navigation Menu"}
            >
                {collapsed ? <Menu size={20} strokeWidth={2.2} /> : <X size={20} strokeWidth={2.2} />}
            </button>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
                {icon && (
                    <div className="hidden lg:flex p-2 bg-brand-emerald/10 text-brand-emerald rounded-xl shadow-inner flex-shrink-0">
                        {icon}
                    </div>
                )}
                <div className="min-w-0 flex-1 overflow-hidden">
                    <h1 className="text-base sm:text-xl lg:text-3xl font-black tracking-tight text-brand-charcoal dark:text-white truncate m-0 leading-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="hidden lg:block text-xs sm:text-sm font-medium text-brand-muted dark:text-slate-400 mt-0.5 m-0 truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopbarLeft;
