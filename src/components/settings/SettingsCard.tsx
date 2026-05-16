import type { ReactNode } from 'react';
import { Button, Card } from '../primitives';

interface SettingsCardProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?: () => void;
  children: ReactNode;
}

export function SettingsCard({
  title,
  subtitle,
  actionLabel,
  actionDisabled,
  onAction,
  children,
}: SettingsCardProps) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 20 }}>
        <div className="tw-h3-serif" style={{ fontSize: 20, fontWeight: 500 }}>
          {title}
        </div>
        {subtitle && (
          <div className="tw-small" style={{ color: 'var(--text-2)', marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </div>
      {children}
      {actionLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: 20,
            paddingTop: 20,
            borderTop: '1px solid var(--border-faint)',
          }}
        >
          <Button variant="primary" disabled={actionDisabled} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </Card>
  );
}
