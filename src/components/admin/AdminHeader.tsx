import type { ReactNode } from 'react';
import { NotifPill } from '../primitives';

interface AdminHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function AdminHeader({ eyebrow, title, subtitle, right }: AdminHeaderProps) {
  return (
    <div style={{ padding: '24px 32px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <div className="tw-eyebrow" style={{ marginBottom: 8 }}>
            {eyebrow}
          </div>
          <h1 className="tw-h1" style={{ fontSize: 36 }}>
            {title}
          </h1>
          {subtitle && (
            <div className="tw-body" style={{ color: 'var(--text-2)', marginTop: 6, fontSize: 15 }}>
              {subtitle}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
          {right}
          <NotifPill />
        </div>
      </div>
    </div>
  );
}
