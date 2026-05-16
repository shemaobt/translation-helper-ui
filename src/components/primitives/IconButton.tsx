import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from '../Icon';

export type IconButtonSize = 24 | 28 | 32 | 36 | 40 | 44 | 56;
export type IconButtonVariant = 'ghost' | 'soft' | 'paper' | 'accent';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  size?: IconButtonSize;
  iconSize?: number;
  variant?: IconButtonVariant;
  active?: boolean;
  destructive?: boolean;
  hoverFill?: boolean;
}

const VARIANT_BG: Record<IconButtonVariant, string> = {
  ghost: 'transparent',
  soft: 'var(--surface-2)',
  paper: 'var(--paper)',
  accent: 'var(--accent)',
};

const VARIANT_FG: Record<IconButtonVariant, string> = {
  ghost: 'var(--text-2)',
  soft: 'var(--text-2)',
  paper: 'var(--text-2)',
  accent: 'var(--on-accent)',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    size = 36,
    iconSize,
    variant = 'ghost',
    active,
    destructive,
    hoverFill = true,
    style,
    className,
    type = 'button',
    ...rest
  },
  ref,
) {
  const fg = destructive ? 'var(--destructive)' : active ? 'var(--accent)' : VARIANT_FG[variant];
  const bg = active ? 'var(--accent-soft)' : VARIANT_BG[variant];
  const showBorder = variant === 'paper';
  const classes = ['tw-focusable', hoverFill && variant === 'ghost' ? 'tw-hover-surface' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: bg,
        color: fg,
        border: showBorder ? '1px solid var(--border-subtle)' : '1px solid transparent',
        boxShadow: variant === 'paper' ? 'var(--shadow-xs)' : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={iconSize ?? Math.round(size * 0.42)} />
    </button>
  );
});
