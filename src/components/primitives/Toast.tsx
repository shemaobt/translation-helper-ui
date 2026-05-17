import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  variant?: ToastVariant;
  title: ReactNode;
  body?: ReactNode;
  style?: CSSProperties;
}

interface VariantTheme {
  fg: string;
  bg: string;
  icon: IconName;
}

const VARIANTS: Record<ToastVariant, VariantTheme> = {
  success: { fg: 'var(--success)', bg: 'var(--success-soft)', icon: 'check-circle' },
  error: { fg: 'var(--destructive)', bg: 'var(--destructive-soft)', icon: 'alert-circle' },
  warning: { fg: 'var(--warning)', bg: 'var(--warning-soft)', icon: 'alert-triangle' },
  info: { fg: 'var(--accent)', bg: 'var(--accent-soft)', icon: 'info' },
};

export function Toast({ variant = 'success', title, body, style }: ToastProps) {
  const v = VARIANTS[variant];
  return (
    <div
      className="tw-toast-enter"
      style={{
        minWidth: 280,
        maxWidth: 420,
        background: v.bg,
        border: `1px solid color-mix(in oklab, ${v.fg} 22%, transparent)`,
        borderRadius: 18,
        boxShadow:
          '0 22px 48px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        ...style,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 12,
          background: `color-mix(in oklab, ${v.fg} 18%, transparent)`,
          color: v.fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto',
          border: `1px solid color-mix(in oklab, ${v.fg} 28%, transparent)`,
        }}
      >
        <Icon name={v.icon} size={15} strokeWidth={1.8} />
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <div
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 15,
            fontWeight: 500,
            lineHeight: 1.25,
            color: 'var(--text)',
            fontVariationSettings: '"opsz" 144, "SOFT" 50',
          }}
        >
          {title}
        </div>
        {body && (
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: 'var(--text-2)',
              marginTop: 4,
            }}
          >
            {body}
          </div>
        )}
      </div>
    </div>
  );
}
