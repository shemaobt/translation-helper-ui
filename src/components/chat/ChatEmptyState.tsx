import { useTranslation } from 'react-i18next';
import type { Agent } from '../../lib/agents';
import { Icon } from '../Icon';
import { AgentIconBadge } from './AgentIconBadge';

interface ChatEmptyStateProps {
  agent: Agent;
  onPickStarter: (prompt: string) => void;
}

export function ChatEmptyState({ agent, onPickStarter }: ChatEmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        width: '100%',
        maxWidth: 640,
        margin: '0 auto',
      }}
    >
      <AgentIconBadge agent={agent} size={72} iconSize={28} />
      <h2 className="tw-h1" style={{ marginTop: 22, fontSize: 36 }}>
        {t(`agents.${agent.id}.name`)}
      </h2>
      <div
        className="tw-body"
        style={{
          textAlign: 'center',
          color: 'var(--text-2)',
          marginTop: 8,
          maxWidth: 480,
          fontSize: 15,
        }}
      >
        {t(`agents.${agent.id}.description`)}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginTop: 32,
          width: '100%',
          maxWidth: 540,
        }}
      >
        <div className="tw-eyebrow" style={{ paddingLeft: 6, marginBottom: 4 }}>
          {t('welcome.inspirationTitle')}
        </div>
        {agent.starters.map((p) => (
          <button
            key={p}
            onClick={() => onPickStarter(p)}
            className="tw-row-paper tw-lift tw-focusable"
            style={{
              padding: '14px 18px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 16,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: 'var(--shadow-xs)',
              width: '100%',
              textAlign: 'left',
              color: 'var(--text)',
            }}
          >
            <span style={{ color: 'var(--accent)' }}>
              <Icon name="sparkles" size={15} />
            </span>
            <span style={{ flex: 1 }}>{p}</span>
            <Icon name="arrow-right" size={15} style={{ color: 'var(--text-4)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
