import type { CSSProperties } from 'react';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  tone?: 'accent' | 'muted' | 'inherit';
  label?: string;
  style?: CSSProperties;
}

const SIZE_PX: Record<SpinnerSize, { box: number; stroke: number }> = {
  xs: { box: 12, stroke: 2 },
  sm: { box: 16, stroke: 2 },
  md: { box: 22, stroke: 2.2 },
  lg: { box: 32, stroke: 2.6 },
};

const TONE_COLOR: Record<NonNullable<SpinnerProps['tone']>, string> = {
  accent: 'var(--accent)',
  muted: 'var(--text-3)',
  inherit: 'currentColor',
};

export function Spinner({ size = 'sm', tone = 'accent', label, style }: SpinnerProps) {
  const s = SIZE_PX[size];
  const color = TONE_COLOR[tone];
  const radius = (s.box - s.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <span
      role={label ? 'status' : undefined}
      aria-live={label ? 'polite' : undefined}
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        ...style,
      }}
    >
      <svg
        className="tw-spin"
        width={s.box}
        height={s.box}
        viewBox={`0 0 ${s.box} ${s.box}`}
        aria-hidden="true"
      >
        <circle
          cx={s.box / 2}
          cy={s.box / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeOpacity={0.18}
          strokeWidth={s.stroke}
        />
        <circle
          cx={s.box / 2}
          cy={s.box / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={s.stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.28} ${circumference}`}
        />
      </svg>
    </span>
  );
}
