import type { CSSProperties, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, NotifPill } from '../primitives';
import { useTheme } from '../Theme';

interface TopBarProps {
  children?: ReactNode;
  style?: CSSProperties;
}

export function TopBar({ children, style }: TopBarProps) {
  const { t } = useTranslation();
  const { mode, toggle } = useTheme();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 10,
        padding: '20px 32px 0',
        ...style,
      }}
    >
      {children}
      <IconButton
        icon="sparkles"
        variant="paper"
        onClick={toggle}
        aria-label={mode === 'dark' ? t('common.switchToLight') : t('common.switchToDark')}
        iconSize={15}
        hoverFill={false}
      />
      <span className="tw-only-desktop">
        <NotifPill />
      </span>
    </div>
  );
}
