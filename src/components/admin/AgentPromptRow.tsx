import { useTranslation } from 'react-i18next';
import type { Agent } from '../../lib/agents';
import { useIsMobile } from '../../lib/hooks/useIsMobile';
import type { PromptDraft } from '../../lib/hooks/useAgentPrompts';
import { Icon } from '../Icon';
import { Button, Input, Textarea } from '../primitives';
import { AgentIconBadge } from '../chat/AgentIconBadge';

interface AgentPromptRowProps {
  agent: Agent;
  draft: PromptDraft;
  onToggle: () => void;
  onChange: (patch: Partial<PromptDraft>) => void;
  onReset: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function AgentPromptRow({
  agent,
  draft,
  onToggle,
  onChange,
  onReset,
  onCancel,
  onSave,
}: AgentPromptRowProps) {
  const { t } = useTranslation();
  const { expanded, unsaved } = draft;
  const isMobile = useIsMobile();
  return (
    <div
      style={{
        background: 'var(--paper)',
        border: `1px solid ${expanded ? 'var(--border)' : 'var(--border-subtle)'}`,
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: expanded ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
        position: 'relative',
      }}
    >
      {expanded && (
        <div
          style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: 'var(--accent)' }}
        />
      )}
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '18px 22px',
          cursor: 'pointer',
          borderBottom: expanded ? '1px solid var(--border-faint)' : 'none',
          width: '100%',
          textAlign: 'left',
          background: 'transparent',
        }}
      >
        <AgentIconBadge agent={agent} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="tw-h3-serif" style={{ fontSize: 18, fontWeight: 500 }}>
              {draft.name}
            </span>
            {unsaved && <UnsavedBadge />}
          </div>
          <div
            className="tw-small"
            style={{
              color: 'var(--text-2)',
              marginTop: 3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {t(`agents.${agent.id}.description`)}
          </div>
        </div>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-right'}
          size={16}
          style={{ color: 'var(--text-3)' }}
        />
      </button>
      {expanded && (
        <div
          style={{
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            background: 'var(--surface)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
              gap: 12,
            }}
          >
            <Input
              label={t('adminPrompts.name')}
              value={draft.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
            <Input
              label={t('adminPrompts.shortDescription')}
              value={draft.short}
              onChange={(e) => onChange({ short: e.target.value })}
            />
          </div>
          <Textarea
            label={t('adminPrompts.systemPrompt')}
            value={draft.prompt}
            onChange={(e) => onChange({ prompt: e.target.value })}
            monospace
            style={{ minHeight: 260, fontSize: 13 }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <Button variant="ghost" leadingIcon="refresh" onClick={onReset}>
              {t('adminPrompts.resetToDefault')}
            </Button>
            <div style={{ flex: 1, minWidth: isMobile ? 0 : 'auto' }} />
            <Button variant="secondary" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" leadingIcon="check" onClick={onSave}>
              {t('adminPrompts.saveChanges')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function UnsavedBadge() {
  const { t } = useTranslation();
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        color: 'var(--warning)',
        background: 'var(--warning-soft)',
        padding: '3px 9px',
        borderRadius: 999,
        fontWeight: 500,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--warning)' }} />
      {t('adminPrompts.unsavedChanges')}
    </span>
  );
}
