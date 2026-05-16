import type { CSSProperties } from 'react';
import { Icon, type IconName } from '../Icon';

export interface DropdownItem {
  label?: string;
  icon?: IconName;
  badge?: string | number;
  badgeAccent?: boolean;
  destructive?: boolean;
  highlight?: boolean;
  divider?: boolean;
  section?: string;
  onSelect?: () => void;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  width?: number | string;
  style?: CSSProperties;
}

export function DropdownMenu({ items, width = 220, style }: DropdownMenuProps) {
  return (
    <div
      style={{
        width,
        background: 'var(--paper)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 14,
        boxShadow: 'var(--shadow-md)',
        padding: 6,
        ...style,
      }}
    >
      {items.map((it, i) => {
        if (it.divider) {
          return (
            <div
              key={i}
              style={{ height: 1, background: 'var(--border-subtle)', margin: '5px 4px' }}
            />
          );
        }
        if (it.section) {
          return (
            <div key={i} className="tw-eyebrow" style={{ padding: '8px 12px 4px' }}>
              {it.section}
            </div>
          );
        }
        return (
          <button
            key={i}
            onClick={it.onSelect}
            className="tw-hover-surface"
            style={{
              height: 36,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 10px',
              borderRadius: 10,
              fontSize: 13,
              color: it.destructive ? 'var(--destructive)' : 'var(--text)',
              background: it.highlight ? 'var(--surface-2)' : 'transparent',
              width: '100%',
              textAlign: 'left',
            }}
          >
            {it.icon && (
              <Icon
                name={it.icon}
                size={15}
                style={{ color: it.destructive ? 'var(--destructive)' : 'var(--text-3)' }}
              />
            )}
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.badge != null && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: it.badgeAccent ? 'var(--accent-soft)' : 'var(--surface-2)',
                  color: it.badgeAccent ? 'var(--accent)' : 'var(--text-2)',
                }}
              >
                {it.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
