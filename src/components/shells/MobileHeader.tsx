import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDrawer } from './DrawerContext';
import { IconButton, Wordmark } from '../primitives';
import { useTheme } from '../Theme';

interface MobileHeaderProps {
  title?: string;
  actions?: ReactNode;
  showBrand?: boolean;
}

export function MobileHeader({ title, actions, showBrand = false }: MobileHeaderProps) {
  const { t } = useTranslation();
  const { openDrawer } = useDrawer();
  const { mode, toggle } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 14px',
        borderBottom: '1px solid var(--border-faint)',
        background: 'var(--surface)',
        minHeight: 56,
        position: 'sticky',
        top: 0,
        zIndex: 5,
      }}
    >
      <IconButton icon="menu" onClick={openDrawer} aria-label={t('nav.openUserMenu')} />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          textAlign: showBrand && !title ? 'left' : 'center',
        }}
      >
        {title ? (
          <div
            className="tw-h3-serif"
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: 'var(--text)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </div>
        ) : showBrand ? (
          <Wordmark size={16} />
        ) : null}
      </div>
      {actions ?? (
        <IconButton
          icon="sparkles"
          onClick={toggle}
          aria-label={mode === 'dark' ? t('common.switchToLight') : t('common.switchToDark')}
          iconSize={15}
        />
      )}
    </div>
  );
}
