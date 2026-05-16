import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';

type Tone = 'destructive' | 'success' | 'accent' | 'neutral';

interface DialogShellProps {
  title: ReactNode;
  icon: IconName;
  tone?: Tone;
  children: ReactNode;
}

const TONES: Record<Tone, { bg: string; fg: string }> = {
  destructive: { bg: 'var(--destructive-soft)', fg: 'var(--destructive)' },
  success: { bg: 'var(--success-soft)', fg: 'var(--success)' },
  accent: { bg: 'var(--accent-soft)', fg: 'var(--accent)' },
  neutral: { bg: 'var(--surface-2)', fg: 'var(--text-2)' },
};

export function DialogShell({ title, icon, tone = 'neutral', children }: DialogShellProps) {
  const t = TONES[tone];
  return (
    <div
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 22,
        padding: 28,
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 10 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: t.bg,
            color: t.fg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 auto',
            border: `1px solid color-mix(in oklab, ${t.fg} 24%, transparent)`,
          }}
        >
          <Icon name={icon} size={20} strokeWidth={1.6} />
        </div>
        <div style={{ flex: 1, paddingTop: 4 }}>
          <div className="tw-h3-serif" style={{ fontSize: 22 }}>
            {title}
          </div>
        </div>
      </div>
      <div style={{ paddingLeft: 60, marginTop: 6 }}>{children}</div>
    </div>
  );
}
