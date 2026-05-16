import type { CSSProperties } from 'react';

type Corner = 'top-right' | 'bottom-right' | 'bottom-left';

interface Props {
  corner: Corner;
  size?: number;
  opacity?: number;
  offset?: number;
}

const positionFor = (corner: Corner, size: number, offset: number): CSSProperties => {
  switch (corner) {
    case 'top-right':
      return { top: -offset, right: -offset, width: size, height: size };
    case 'bottom-right':
      return { bottom: -offset, right: -offset, width: size, height: size };
    case 'bottom-left':
      return { bottom: -offset, left: -offset, width: size, height: size };
  }
};

const pathFor = (corner: Corner, r: number) => {
  switch (corner) {
    case 'top-right':
      return `M 200 ${r} A ${r} ${r} 0 0 1 ${200 - r} 0`;
    case 'bottom-right':
      return `M 200 ${200 - r} A ${r} ${r} 0 0 0 ${200 - r} 200`;
    case 'bottom-left':
      return `M 0 200 A ${r} ${r} 0 0 0 ${r} ${200 - r}`;
  }
};

export function ShemaWaveDecor({ corner, size = 480, opacity = 0.06, offset = 120 }: Props) {
  return (
    <svg
      style={{
        position: 'absolute',
        opacity,
        pointerEvents: 'none',
        zIndex: 0,
        ...positionFor(corner, size, offset),
      }}
      viewBox="0 0 200 200"
      fill="none"
    >
      {[40, 80, 120, 160].map((r) => (
        <path key={r} d={pathFor(corner, r)} stroke="var(--accent)" strokeWidth="2.5" fill="none" />
      ))}
    </svg>
  );
}
