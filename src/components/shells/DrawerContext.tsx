import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface DrawerContextValue {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  setOpen: (next: boolean) => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);

  const value = useMemo<DrawerContextValue>(
    () => ({ open, openDrawer, closeDrawer, setOpen }),
    [open, openDrawer, closeDrawer],
  );

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    return {
      open: false,
      openDrawer: () => {},
      closeDrawer: () => {},
      setOpen: () => {},
    };
  }
  return ctx;
}
