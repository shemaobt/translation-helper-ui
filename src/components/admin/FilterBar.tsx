import type { ReactNode } from 'react';

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        background: 'var(--paper)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {children}
    </div>
  );
}
