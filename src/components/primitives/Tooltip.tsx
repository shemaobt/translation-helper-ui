import type { CSSProperties, ReactNode } from 'react';

type Placement = 'top' | 'bottom';

interface TooltipProps {
  label: string;
  placement?: Placement;
  children: ReactNode;
  style?: CSSProperties;
}

export function Tooltip({ label, placement = 'top', children, style }: TooltipProps) {
  return (
    <span
      className="tw-tooltip-wrap"
      style={{
        position: 'relative',
        display: 'inline-flex',
        ...style,
      }}
    >
      {children}
      <span
        className="tw-tooltip"
        role="tooltip"
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          top: placement === 'top' ? 'auto' : 'calc(100% + 8px)',
          bottom: placement === 'top' ? 'calc(100% + 8px)' : 'auto',
          background: 'var(--text)',
          color: 'var(--surface)',
          fontSize: 12,
          fontWeight: 500,
          padding: '5px 10px',
          borderRadius: 8,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 140ms ease-out, transform 140ms ease-out',
          boxShadow: 'var(--shadow-md)',
          zIndex: 50,
        }}
      >
        {label}
      </span>
    </span>
  );
}
