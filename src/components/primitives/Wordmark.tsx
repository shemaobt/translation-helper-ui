interface WordmarkProps {
  size?: number;
}

export function Wordmark({ size = 22 }: WordmarkProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
      <div
        style={{
          fontFamily: 'inherit',
          fontSize: size,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: '-0.015em',
          color: 'var(--accent)',
        }}
      >
        Translation<span style={{ color: 'var(--text)' }}>.</span>Helper
      </div>
    </div>
  );
}
