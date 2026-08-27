import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const getStoredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('pathwise-theme') as ThemeMode) || 'dark';
};

const applyThemeToDocument = (theme: ThemeMode): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark';

  const root = document.documentElement;
  let effective: 'light' | 'dark' = 'dark';

  if (theme === 'system') {
    effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } else {
    effective = theme;
  }

  if (effective === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  return effective;
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialTheme = getStoredTheme();
  const initialResolved = typeof window !== 'undefined' ? applyThemeToDocument(initialTheme) : 'dark';

  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (get().theme === 'system') {
        const resolved = applyThemeToDocument('system');
        set({ resolvedTheme: resolved });
      }
    });
  }

  return {
    theme: initialTheme,
    resolvedTheme: initialResolved,
    setTheme: (newTheme: ThemeMode) => {
      localStorage.setItem('pathwise-theme', newTheme);
      const resolved = applyThemeToDocument(newTheme);
      set({ theme: newTheme, resolvedTheme: resolved });
    },
    toggleTheme: () => {
      const current = get().resolvedTheme;
      const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('pathwise-theme', next);
      const resolved = applyThemeToDocument(next);
      set({ theme: next, resolvedTheme: resolved });
    },
  };
});
