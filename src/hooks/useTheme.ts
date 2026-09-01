import { useEffect, useState } from 'react';

function getInitialIsDark() {
    try {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return saved ? saved === 'dark' : prefersDark;
    } catch {
        return false;
    }
}

export function useTheme() {
    // Lazy-initialized so React's state matches the `dark` class the inline
    // script in index.html already applied before first paint — no effect
    // needed (and no flash-of-wrong-theme) to correct it after mount.
    const [isDark, setIsDark] = useState(getInitialIsDark);

    useEffect(() => {
        // Listen for OS preference changes (only when no manual override saved)
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme')) {
                setIsDark(e.matches);
                document.documentElement.classList.toggle('dark', e.matches);
            }
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const toggle = () => {
        setIsDark(prev => {
            const next = !prev;
            document.documentElement.classList.toggle('dark', next);
            localStorage.setItem('theme', next ? 'dark' : 'light');
            return next;
        });
    };

    return { isDark, toggle };
}
