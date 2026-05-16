import { Icon } from '../Icon';

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  dot?: boolean;
}

export function StatCard({ label, value, delta, dot }: StatCardProps) {
  const isPositive = !!delta?.startsWith('+');
  return (
    <div
      style={{
        flex: 1,
        padding: '18px 22px',
        background: 'var(--paper)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 18,
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="tw-eyebrow">{label}</span>
        {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent)' }} />}
      </div>
      <div
        style={{
          fontFamily: 'Fraunces, serif',
          fontSize: 32,
          fontWeight: 500,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--text)',
        }}
      >
        {value}
      </div>
      {delta && (
        <div
          className="tw-micro"
          style={{
            color: 'var(--text-2)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 2,
          }}
        >
          <Icon
            name={isPositive ? 'arrow-up' : 'arrow-right'}
            size={11}
            style={{ color: isPositive ? 'var(--success)' : 'var(--text-3)' }}
          />
          {delta}
        </div>
      )}
    </div>
  );
}
