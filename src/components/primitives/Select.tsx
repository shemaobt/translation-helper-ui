import type { CSSProperties } from 'react';
import { Icon } from '../Icon';

interface SelectProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  containerStyle?: CSSProperties;
}

export function Select({ label, value, onChange, options, placeholder, containerStyle }: SelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...containerStyle }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500 }}>{label}</label>}
      <div
        style={{
          height: 48,
          background: 'var(--paper)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 14,
          color: value ? 'var(--text)' : 'var(--text-3)',
          boxShadow: 'var(--shadow-xs)',
          position: 'relative',
        }}
      >
        <span style={{ flex: 1 }}>{value || placeholder || ''}</span>
        <Icon name="chevron-down" size={16} style={{ color: 'var(--text-3)' }} />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: 'pointer',
            width: '100%',
            height: '100%',
          }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
