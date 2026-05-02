'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggleButton() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-surface/50 backdrop-blur-md border border-border text-text-secondary hover:text-text-primary hover:bg-surface transition-all shadow-lg hover:shadow-xl focus:outline-none"
            title="Toggle Theme"
        >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
}
