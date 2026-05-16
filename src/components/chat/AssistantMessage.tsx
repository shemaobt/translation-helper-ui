import type { ReactNode } from 'react';
import { AGENT_BY_ID, type AgentId } from '../../lib/agents';
import { Icon } from '../Icon';
import { Streaming } from '../primitives';
import { MessageActions } from './MessageActions';

interface AssistantMessageProps {
  agent?: AgentId;
  streaming?: boolean;
  firstOfTurn?: boolean;
  copyText?: string;
  children: ReactNode;
}

export function AssistantMessage({
  agent = 'storyteller',
  streaming,
  firstOfTurn = true,
  copyText,
  children,
}: AssistantMessageProps) {
  const a = AGENT_BY_ID[agent];
  return (
    <div style={{ marginTop: 28 }}>
      {firstOfTurn && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={a.icon as never} size={13} />
          </div>
          <span
            style={{
              fontFamily: 'Fraunces, serif',
              fontStyle: 'italic',
              fontSize: 15,
              color: 'var(--accent)',
              fontWeight: 500,
            }}
          >
            {a.name}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--text-4)' }} />
          <span className="tw-micro" style={{ color: 'var(--text-3)' }}>
            just now
          </span>
        </div>
      )}
      <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text)' }}>
        {children}
        {streaming && (
          <span style={{ color: 'var(--text-3)' }}>
            <Streaming />
          </span>
        )}
      </div>
      {firstOfTurn && !streaming && <MessageActions copyText={copyText} />}
    </div>
  );
}
