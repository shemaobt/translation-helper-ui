import { Icon, type IconName } from '../Icon';

interface FilterFieldProps {
  icon?: IconName;
  value?: string;
  placeholder?: string;
  width?: number | string;
  flex?: number;
  onClick?: () => void;
}

export function FilterField({ icon, value, placeholder, width = 'auto', flex, onClick }: FilterFieldProps) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 36,
        padding: '0 14px',
        background: 'var(--surface-2)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
        color: value ? 'var(--text)' : 'var(--text-3)',
        width,
        flex,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {icon && <Icon name={icon} size={13} style={{ color: 'var(--text-3)' }} />}
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value || placeholder}
      </span>
      <Icon name="chevron-down" size={12} style={{ color: 'var(--text-3)' }} />
    </button>
  );
}
