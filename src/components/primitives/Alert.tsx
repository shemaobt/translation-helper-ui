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
        borderRadius: 16,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        ...style,
      }}
    >
      <div
        style={{
          flex: '0 0 auto',
          marginTop: 1,
          width: 22,
          height: 22,
          borderRadius: 999,
          background: `color-mix(in oklab, ${v.fg} 18%, transparent)`,
          color: v.fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid color-mix(in oklab, ${v.fg} 28%, transparent)`,
        }}
      >
        <Icon name={v.icon} size={12} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.5 }}>
        {title && (
          <div
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--text)',
              marginBottom: children ? 3 : 0,
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
            }}
          >
            {title}
          </div>
        )}
        {children && <div style={{ color: 'var(--text-2)' }}>{children}</div>}
      </div>
    </div>
  );
}
