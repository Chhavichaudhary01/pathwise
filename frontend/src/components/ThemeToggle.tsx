import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

interface ThemeToggleProps {
  variant?: 'compact' | 'pill';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore();

  if (variant === 'pill') {
    return (
      <div className={`p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800 flex items-center gap-1 text-xs ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          title="Light Mode"
          className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 font-bold cursor-pointer ${
            theme === 'light'
              ? 'bg-white text-amber-600 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          title="Dark Mode"
          className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 font-bold cursor-pointer ${
            theme === 'dark'
              ? 'bg-slate-800 text-indigo-400 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('system')}
          title="System Preference"
          className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 font-bold cursor-pointer ${
            theme === 'system'
              ? 'bg-white dark:bg-slate-800 text-[#5051F9] shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Auto</span>
        </button>
      </div>
    );
  }

  // Compact variant (icon button)
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-2xs hover:shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 rotate-0 transition-transform duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600 rotate-0 transition-transform duration-300" />
      )}
    </button>
  );
};

export default ThemeToggle;
