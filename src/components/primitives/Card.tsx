import type { CSSProperties, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  padded?: boolean;
  style?: CSSProperties;
}

export function Card({ children, padded = true, style }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 18,
        padding: padded ? 24 : 0,
        boxShadow: 'var(--shadow-xs)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
