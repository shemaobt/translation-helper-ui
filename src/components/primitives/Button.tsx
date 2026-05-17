import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from '../Icon';
import { Spinner } from './Spinner';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'ghost-strong'
  | 'soft'
  | 'dark'
  | 'destructive'
  | 'destructive-solid';

export type ButtonSize = 'sm' | 'default' | 'md' | 'lg' | 'icon' | 'icon-sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
}

const SIZES: Record<
  ButtonSize,
  { h: number; px: number; fs: number; gap: number; ic: number; sq?: boolean }
> = {
  sm: { h: 32, px: 14, fs: 13, gap: 7, ic: 14 },
  default: { h: 40, px: 18, fs: 14, gap: 8, ic: 16 },
  md: { h: 44, px: 20, fs: 14, gap: 8, ic: 16 },
  lg: { h: 52, px: 26, fs: 15, gap: 10, ic: 18 },
  icon: { h: 40, px: 0, fs: 14, gap: 0, ic: 16, sq: true },
  'icon-sm': { h: 32, px: 0, fs: 14, gap: 0, ic: 14, sq: true },
};

const VARIANTS: Record<ButtonVariant, { bg: string; fg: string; bd: string; sh: string }> = {
  primary: { bg: 'var(--accent)', fg: 'var(--on-accent)', bd: 'transparent', sh: 'var(--shadow-sm)' },
  secondary: { bg: 'var(--paper)', fg: 'var(--text)', bd: 'var(--border)', sh: 'var(--shadow-xs)' },
  ghost: { bg: 'transparent', fg: 'var(--text-2)', bd: 'transparent', sh: 'none' },
  'ghost-strong': { bg: 'transparent', fg: 'var(--text)', bd: 'transparent', sh: 'none' },
  soft: { bg: 'var(--surface-2)', fg: 'var(--text)', bd: 'var(--border-subtle)', sh: 'none' },
  dark: { bg: 'var(--pill-active)', fg: 'var(--pill-active-fg)', bd: 'transparent', sh: 'var(--shadow-sm)' },
  destructive: { bg: 'transparent', fg: 'var(--destructive)', bd: 'var(--destructive)', sh: 'none' },
  'destructive-solid': { bg: 'var(--destructive)', fg: '#fff', bd: 'transparent', sh: 'var(--shadow-sm)' },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'default',
    leadingIcon,
    trailingIcon,
    loading,
    disabled,
    fullWidth,
    children,
    style,
    type = 'button',
    ...rest
  },
  ref,
) {
  const s = SIZES[size];
  const v = VARIANTS[variant];
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className="tw-focusable"
      style={{
        height: s.h,
        width: s.sq ? s.h : fullWidth ? '100%' : 'auto',
        padding: s.sq ? 0 : `0 ${s.px}px`,
        fontSize: s.fs,
        fontWeight: 500,
        letterSpacing: '-0.005em',
        background: v.bg,
        color: v.fg,
        border: `1px solid ${v.bd}`,
        borderRadius: 999,
        boxShadow: v.sh,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background 180ms ease-out, box-shadow 180ms ease-out, transform 90ms ease-out',
        ...style,
      }}
      {...rest}
    >
      {loading && <Spinner size={s.ic <= 14 ? 'xs' : 'sm'} tone="inherit" />}
      {!loading && leadingIcon && <Icon name={leadingIcon} size={s.ic} strokeWidth={1.85} />}
      {children}
      {!loading && trailingIcon && <Icon name={trailingIcon} size={s.ic} strokeWidth={1.85} />}
    </button>
  );
});
