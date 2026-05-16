import type { ReactNode } from 'react';

interface OverlayProps {
  onClose?: () => void;
  children: ReactNode;
}

export function Overlay({ onClose, children }: OverlayProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--overlay)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        zIndex: 60,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 480 }}>
        {children}
      </div>
    </div>
  );
}
