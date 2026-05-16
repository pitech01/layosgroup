import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export default function ThemeToggle() {
    const { isDark, toggle } = useTheme();

    return (
        <button
            onClick={toggle}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-beige dark:bg-white/5 text-brand-muted dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 hover:text-brand-emerald hover:scale-110 transition-all duration-300 border-none cursor-pointer shadow-sm"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
}
