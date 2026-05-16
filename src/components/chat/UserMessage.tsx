import type { ReactNode } from 'react';
import { useIsMobile } from '../../lib/hooks/useIsMobile';

interface UserMessageProps {
  children: ReactNode;
  time?: string;
}

export function UserMessage({ children, time }: UserMessageProps) {
  const isMobile = useIsMobile();
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: isMobile ? 18 : 24 }}>
      <div style={{ maxWidth: isMobile ? '90%' : '76%' }}>
        <div
          style={{
            background: 'var(--paper)',
            borderRadius: 22,
            padding: '14px 18px',
            fontSize: 14.5,
            lineHeight: 1.55,
            color: 'var(--text)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {children}
        </div>
        {time && (
          <div
            className="tw-micro"
            style={{ color: 'var(--text-4)', textAlign: 'right', marginTop: 6, paddingRight: 8 }}
          >
            {time}
          </div>
        )}
      </div>
    </div>
  );
}
