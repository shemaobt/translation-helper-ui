import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastProps {
  variant?: ToastVariant;
  title: ReactNode;
  body?: ReactNode;
  style?: CSSProperties;
}

const COLORS: Record<ToastVariant, string> = {
  success: 'var(--success)',
  error: 'var(--destructive)',
  info: 'var(--text-2)',
};

const ICONS: Record<ToastVariant, IconName> = {
  success: 'check',
  error: 'x',
  info: 'info',
};

export function Toast({ variant = 'success', title, body, style }: ToastProps) {
  return (
    <div
      style={{
        width: 340,
        background: 'var(--paper)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        boxShadow: 'var(--shadow-md)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        ...style,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          background: COLORS[variant],
          color: 'var(--paper)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto',
          marginTop: 1,
        }}
      >
        <Icon name={ICONS[variant]} size={12} strokeWidth={3} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
        {body && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{body}</div>}
      </div>
    </div>
  );
}
