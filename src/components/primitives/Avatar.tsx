import type { CSSProperties } from 'react';

interface AvatarProps {
  size?: number;
  name?: string;
  src?: string;
  status?: 'online' | 'away' | 'offline';
  style?: CSSProperties;
}

const STATUS_COLOR: Record<NonNullable<AvatarProps['status']>, string> = {
  online: 'var(--success)',
  away: 'var(--warning)',
  offline: 'var(--text-3)',
};

const initialsFrom = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase() || '?';

export function Avatar({ size = 36, name = '', src, status, style }: AvatarProps) {
  const fs = Math.max(10, Math.round(size * 0.4));
  const dotSize = Math.max(8, Math.round(size * 0.26));

  return (
    <span style={{ position: 'relative', display: 'inline-block', width: size, height: size, ...style }}>
      <span
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          background: src ? `center/cover no-repeat url(${src})` : 'var(--surface-2)',
          color: 'var(--text-2)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: fs,
          fontWeight: 500,
          boxShadow: 'inset 0 0 0 1px var(--border-subtle)',
          overflow: 'hidden',
        }}
      >
        {!src && initialsFrom(name)}
      </span>
      {status && (
        <span
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: dotSize,
            height: dotSize,
            borderRadius: 999,
            background: STATUS_COLOR[status],
            border: '2px solid var(--paper)',
          }}
        />
      )}
    </span>
  );
}
