import type { CSSProperties } from 'react';
import type { Agent } from '../../lib/agents';
import { Icon } from '../Icon';

type Tone = 'accent' | 'neutral';

interface Props {
  agent: Agent;
  size?: number;
  tone?: Tone;
  iconSize?: number;
  style?: CSSProperties;
}

const TONES: Record<Tone, { bg: string; fg: string; bd: string }> = {
  accent: {
    bg: 'var(--accent-soft)',
    fg: 'var(--accent)',
    bd: 'color-mix(in oklab, var(--accent) 24%, transparent)',
  },
  neutral: {
    bg: 'var(--surface-2)',
    fg: 'var(--text-3)',
    bd: 'var(--border-subtle)',
  },
};

export function AgentIconBadge({ agent, size = 44, tone = 'accent', iconSize, style }: Props) {
  const t = TONES[tone];
  const radius = size < 32 ? 999 : Math.min(22, Math.round(size * 0.32));
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto',
        ...style,
      }}
    >
      <Icon name={agent.icon as never} size={iconSize ?? Math.max(11, Math.round(size * 0.42))} strokeWidth={1.7} />
    </div>
  );
}
