import type { CSSProperties, InputHTMLAttributes } from 'react';
import { Icon, type IconName } from '../Icon';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  onTrailingClick?: () => void;
  monospace?: boolean;
  size?: 'default' | 'sm';
  containerStyle?: CSSProperties;
}

export function Input({
  label,
  hint,
  error,
  leadingIcon,
  trailingIcon,
  onTrailingClick,
  monospace,
  size = 'default',
  containerStyle,
  style,
  ...rest
}: InputProps) {
  const h = size === 'sm' ? 40 : 48;
  const disabled = rest.disabled;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...containerStyle }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500 }}>{label}</label>}
      <div
        style={{
          height: h,
          background: disabled ? 'var(--surface-2)' : 'var(--paper)',
          border: `1px solid ${error ? 'var(--destructive)' : 'var(--border-subtle)'}`,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 16px',
          boxShadow: 'var(--shadow-xs)',
          opacity: disabled ? 0.6 : 1,
          transition: 'border-color 160ms ease-out, box-shadow 160ms ease-out',
        }}
        onFocusCapture={(e) => {
          const target = e.currentTarget;
          if (!error) target.style.borderColor = 'var(--accent)';
          target.style.boxShadow = '0 0 0 4px var(--accent-ring), var(--shadow-xs)';
        }}
        onBlurCapture={(e) => {
          const target = e.currentTarget;
          target.style.borderColor = error ? 'var(--destructive)' : 'var(--border-subtle)';
          target.style.boxShadow = 'var(--shadow-xs)';
        }}
      >
        {leadingIcon && <Icon name={leadingIcon} size={16} style={{ color: 'var(--text-3)' }} />}
        <input
          {...rest}
          style={{
            flex: 1,
            border: 0,
            outline: 'none',
            background: 'transparent',
            fontFamily: monospace ? 'ui-monospace, monospace' : 'inherit',
            fontSize: 14,
            color: 'var(--text)',
            minWidth: 0,
            ...style,
          }}
        />
        {trailingIcon && (
          <button
            type="button"
            onClick={onTrailingClick}
            style={{
              color: 'var(--text-3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
              margin: -4,
            }}
          >
            <Icon name={trailingIcon} size={16} />
          </button>
        )}
      </div>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--destructive)' }}>
          <Icon name="alert-circle" size={12} /> {error}
        </div>
      )}
      {hint && !error && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{hint}</div>}
    </div>
  );
}
