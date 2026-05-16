import { Icon, type IconName } from '../Icon';

interface NotifPillProps {
  icon?: IconName;
  count?: number;
}

export function NotifPill({ icon = 'sparkles', count = 1642 }: NotifPillProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 36,
        padding: '0 14px 0 10px',
        borderRadius: 999,
        background: 'var(--paper)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xs)',
        fontSize: 13,
        fontWeight: 500,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: 999,
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={11} strokeWidth={2.2} />
      </span>
      <span>{count.toLocaleString()}</span>
    </div>
  );
}
