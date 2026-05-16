import type { Agent } from '../../lib/agents';
import { Icon } from '../Icon';

interface InspirationCardProps {
  agent: Agent;
  onSelect?: () => void;
}

export function InspirationCard({ agent, onSelect }: InspirationCardProps) {
  return (
    <div
      onClick={onSelect}
      className="tw-lift"
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 22,
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 200,
        cursor: 'pointer',
        boxShadow: 'var(--shadow-xs)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          flex: 1,
          position: 'relative',
          zIndex: 2,
          maxWidth: '70%',
        }}
      >
        <div className="tw-h4" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
          {agent.name}
        </div>
        <div className="tw-small" style={{ color: 'var(--text-2)', lineHeight: 1.5 }}>
          {agent.short}.
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 18,
          bottom: 18,
          zIndex: 1,
          width: 80,
          height: 80,
          background: 'var(--surface-2)',
          borderRadius: 16,
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-3)',
        }}
      >
        <Icon name={agent.icon as never} size={32} strokeWidth={1.5} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 18,
          bottom: 18,
          zIndex: 2,
          width: 40,
          height: 40,
          borderRadius: 999,
          background: 'var(--accent-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)',
        }}
      >
        <Icon name="sparkles" size={16} strokeWidth={1.85} />
      </div>
    </div>
  );
}
