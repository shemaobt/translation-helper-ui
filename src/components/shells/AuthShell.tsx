import type { ReactNode } from 'react';
import { useIsMobile } from '../../lib/hooks/useIsMobile';
import { Wordmark } from '../primitives';
import { ThemeRoot } from '../Theme';
import { ShemaWaveDecor } from './ShemaWaveDecor';

interface AuthShellProps {
  alert?: ReactNode;
  children: ReactNode;
}

export function AuthShell({ alert, children }: AuthShellProps) {
  const isMobile = useIsMobile();
  return (
    <ThemeRoot style={{ minHeight: '100vh' }}>
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          background: 'var(--bg)',
          display: 'flex',
        }}
      >
        <div
          className="tw-app-frame"
          style={{
            flex: 1,
            minHeight: '100vh',
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: isMobile ? '40px 16px 24px' : '64px 24px 32px',
            gap: isMobile ? 20 : 26,
            position: 'relative',
            overflow: 'auto',
          }}
        >
          <ShemaWaveDecor corner="bottom-right" size={isMobile ? 320 : 480} offset={isMobile ? 80 : 120} />

          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 1 }}
          >
            <Wordmark size={isMobile ? 24 : 30} />
            <div
              className="tw-small"
              style={{ color: 'var(--text-3)', textAlign: 'center', maxWidth: 320 }}
            >
              AI tools for Bible translation teams.
            </div>
          </div>

          {alert && <div style={{ width: '100%', maxWidth: 440, zIndex: 1 }}>{alert}</div>}

          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: 'var(--paper)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 22,
              padding: isMobile ? 24 : 36,
              boxShadow: 'var(--shadow-sm)',
              zIndex: 1,
            }}
          >
            {children}
          </div>

          <div
            className="tw-micro"
            style={{
              color: 'var(--text-3)',
              textAlign: 'center',
              zIndex: 1,
              fontStyle: 'italic',
              fontFamily: 'Fraunces, serif',
            }}
          >
            by Shemá · YWAM Brasil
          </div>
        </div>
      </div>
    </ThemeRoot>
  );
}
