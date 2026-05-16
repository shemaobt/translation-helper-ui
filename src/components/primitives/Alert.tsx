import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';

export type AlertVariant = 'info' | 'success' | 'warning' | 'destructive';

interface AlertProps {
  variant?: AlertVariant;
  title?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

const VARIANTS: Record<AlertVariant, { fg: string; bg: string; icon: IconName }> = {
  info: { fg: 'var(--info)', bg: 'var(--info-soft)', icon: 'info' },
  success: { fg: 'var(--success)', bg: 'var(--success-soft)', icon: 'check-circle' },
  warning: { fg: 'var(--warning)', bg: 'var(--warning-soft)', icon: 'alert-triangle' },
  destructive: { fg: 'var(--destructive)', bg: 'var(--destructive-soft)', icon: 'alert-circle' },
};

export function Alert({ variant = 'info', title, children, style }: AlertProps) {
  const v = VARIANTS[variant];
  return (
    <div
      style={{
        background: v.bg,
        border: `1px solid color-mix(in oklab, ${v.fg} 24%, transparent)`,
        borderRadius: 14,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 11,
        ...style,
      }}
    >
      <div
        style={{
          flex: '0 0 auto',
          marginTop: 1,
          width: 18,
          height: 18,
          borderRadius: 999,
          background: v.fg,
          color: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={v.icon} size={11} strokeWidth={2.5} />
      </div>
      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.5 }}>
        {title && <div style={{ fontWeight: 500, marginBottom: children ? 2 : 0 }}>{title}</div>}
        {children && <div style={{ color: 'var(--text-2)' }}>{children}</div>}
      </div>
    </div>
  );
}
