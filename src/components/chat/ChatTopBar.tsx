import { useTranslation } from 'react-i18next';
import { AGENT_BY_ID, type AgentId } from '../../lib/agents';
import { useIsMobile } from '../../lib/hooks/useIsMobile';
import { useToast } from '../../lib/hooks/useToast';
import { Icon } from '../Icon';
import { IconButton, NotifPill } from '../primitives';
import { useDrawer } from '../shells/DrawerContext';

interface ChatTopBarProps {
  title: string;
  agent: AgentId;
}

export function ChatTopBar({ title, agent }: ChatTopBarProps) {
  const { t } = useTranslation();
  const a = AGENT_BY_ID[agent];
  const toast = useToast();
  const isMobile = useIsMobile();
  const { openDrawer } = useDrawer();
  const agentName = t(`agents.${agent}.name`);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: isMobile ? '12px 14px' : '20px 32px',
        borderBottom: '1px solid var(--border-faint)',
      }}
    >
      {isMobile && (
        <IconButton
          icon="menu"
          variant="soft"
          onClick={openDrawer}
          aria-label={t('nav.openUserMenu')}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <button
          onClick={() => toast.show({ title: t('common.comingSoon', { label: 'Rename' }) })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'transparent',
            border: 0,
            padding: 0,
            cursor: 'pointer',
            color: 'inherit',
            maxWidth: '100%',
          }}
        >
          <span
            className="tw-h3-serif"
            style={{
              fontSize: isMobile ? 15 : 18,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'left',
            }}
          >
            {title}
          </span>
          {!isMobile && <Icon name="pencil" size={12} style={{ color: 'var(--text-4)' }} />}
        </button>
        <div
          className="tw-micro"
          style={{ color: 'var(--text-3)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Icon name={a.icon as never} size={11} /> {agentName}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <IconButton
          icon="volume-2"
          aria-label={t('chat.readAloud')}
          onClick={() => toast.show({ title: t('common.comingSoon', { label: t('chat.readAloud') }) })}
        />
        {!isMobile && <NotifPill />}
        <IconButton
          icon="more-horizontal"
          aria-label={t('chat.regenerate')}
          onClick={() => toast.show({ title: t('common.comingSoon', { label: 'Menu' }) })}
        />
      </div>
    </div>
  );
}
