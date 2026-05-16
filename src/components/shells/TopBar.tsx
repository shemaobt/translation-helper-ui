import type { CSSProperties, ReactNode } from 'react';
import { IconButton, NotifPill } from '../primitives';
import { useTheme } from '../Theme';

interface TopBarProps {
  children?: ReactNode;
  style?: CSSProperties;
}

export function TopBar({ children, style }: TopBarProps) {
  const { mode, toggle } = useTheme();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 10,
        padding: '20px 32px 0',
        ...style,
      }}
    >
      {children}
      <IconButton
        icon="sparkles"
        variant="paper"
        onClick={toggle}
        aria-label={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        iconSize={15}
        hoverFill={false}
      />
      <span className="tw-only-desktop">
        <NotifPill />
      </span>
    </div>
  );
}
