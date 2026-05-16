import type { CSSProperties, TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  monospace?: boolean;
  containerStyle?: CSSProperties;
}

export function Textarea({ label, error, monospace, containerStyle, style, ...rest }: TextareaProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...containerStyle }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500 }}>{label}</label>}
      <textarea
        {...rest}
        style={{
          background: 'var(--paper)',
          border: `1px solid ${error ? 'var(--destructive)' : 'var(--border-subtle)'}`,
          borderRadius: 14,
          padding: '14px 16px',
          fontSize: 13.5,
          lineHeight: 1.6,
          color: 'var(--text)',
          fontFamily: monospace ? 'ui-monospace, monospace' : 'inherit',
          boxShadow: 'var(--shadow-xs)',
          outline: 'none',
          resize: 'vertical',
          minHeight: 88,
          ...style,
        }}
      />
    </div>
  );
}
