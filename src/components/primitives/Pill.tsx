import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';

export type PillVariant =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'new'
  | 'read'
  | 'resolved'
  | 'accent'
  | 'neutral'
  | 'accent-outline'
  | 'neutral-outline';

interface PillProps {
  variant?: PillVariant;
  dot?: boolean;
  leadingIcon?: IconName;
  children: ReactNode;
  style?: CSSProperties;
}

const VARIANTS: Record<PillVariant, { fg: string; bg: string; dot?: string; bd?: string }> = {
  pending: { fg: 'var(--warning)', bg: 'var(--warning-soft)', dot: 'var(--warning)' },
  approved: { fg: 'var(--success)', bg: 'var(--success-soft)', dot: 'var(--success)' },
  rejected: { fg: 'var(--destructive)', bg: 'var(--destructive-soft)', dot: 'var(--destructive)' },
  new: { fg: 'var(--info)', bg: 'var(--info-soft)', dot: 'var(--info)' },
  read: { fg: 'var(--text-2)', bg: 'var(--surface-2)' },
  resolved: { fg: 'var(--success)', bg: 'var(--success-soft)', dot: 'var(--success)' },
  accent: { fg: 'var(--accent)', bg: 'var(--accent-soft)' },
  neutral: { fg: 'var(--text-2)', bg: 'var(--surface-2)' },
  'accent-outline': { fg: 'var(--accent)', bg: 'transparent', bd: 'var(--accent)' },
  'neutral-outline': { fg: 'var(--text-2)', bg: 'transparent', bd: 'var(--border)' },
};

export function Pill({ variant = 'neutral', dot, leadingIcon, children, style }: PillProps) {
  const v = VARIANTS[variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        fontWeight: 500,
        lineHeight: 1,
        height: 22,
        padding: '0 10px',
        borderRadius: 999,
        background: v.bg,
        color: v.fg,
        border: `1px solid ${v.bd || 'transparent'}`,
        letterSpacing: '-0.003em',
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: v.dot || 'currentColor',
          }}
        />
      )}
      {leadingIcon && <Icon name={leadingIcon} size={11} />}
      {children}
    </span>
  );
}
