import type { ReactNode } from 'react';
import { useIsMobile } from '../../lib/hooks/useIsMobile';
import { Sidebar } from '../Sidebar';
import { ThemeRoot } from '../Theme';
import { DrawerProvider, useDrawer } from './DrawerContext';

interface AppShellProps {
  children: ReactNode;
  presentational?: boolean;
}

export function AppShell({ children, presentational }: AppShellProps) {
  return (
    <DrawerProvider>
      <AppShellInner presentational={presentational}>{children}</AppShellInner>
    </DrawerProvider>
  );
}

function AppShellInner({ children, presentational }: AppShellProps) {
  const isMobile = useIsMobile();
  const { open, closeDrawer } = useDrawer();

  return (
    <ThemeRoot presentational={presentational} style={{ height: '100vh', overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          background: 'var(--bg)',
          display: 'flex',
        }}
      >
        <div
          className="tw-app-frame"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          {!isMobile && <Sidebar />}
          <main
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              background: 'var(--surface)',
            }}
          >
            {children}
          </main>
        </div>
      </div>
      {isMobile && <Sidebar mobile open={open} onClose={closeDrawer} />}
    </ThemeRoot>
  );
}
