import { createContext, useContext, useEffect, useMemo, useState, type ReactNode, type CSSProperties } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeCtx {
  mode: ThemeMode;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ mode: 'light', toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem('th-mode');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    window.localStorage.setItem('th-mode', mode);
    document.documentElement.style.background = mode === 'dark' ? '#1A170F' : '#F4EFE7';
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const value = useMemo<ThemeCtx>(
    () => ({ mode, toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')) }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeRootProps {
  children: ReactNode;
  presentational?: boolean;
  style?: CSSProperties;
}

export function ThemeRoot({ children, presentational, style }: ThemeRootProps) {
  const { mode } = useTheme();
  return (
    <div
      className={`tw-root tw-${mode}${presentational ? ' tw-presentational' : ''}`}
      style={{ minHeight: '100vh', background: 'var(--bg)', ...style }}
    >
      {children}
    </div>
  );
}
