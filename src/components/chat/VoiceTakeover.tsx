import { Icon } from '../Icon';
import { Button } from '../primitives';

interface VoiceTakeoverProps {
  elapsedMs?: number;
  onCancel?: () => void;
  onSend?: () => void;
}

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VoiceTakeover({ elapsedMs = 0, onCancel, onSend }: VoiceTakeoverProps) {
  return (
    <div
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--accent)',
        borderRadius: 22,
        padding: 24,
        boxShadow: '0 0 0 4px var(--accent-ring), var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <button
        className="tw-mic-pulse"
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          background: 'var(--accent)',
          color: 'var(--on-accent)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Icon name="mic" size={22} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="tw-label"
          style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 10 }}
        >
          Listening…
          <span style={{ color: 'var(--accent)' }} className="tw-wave">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </span>
        </div>
        <div className="tw-small" style={{ color: 'var(--text-2)', marginTop: 4 }}>
          Tap <span style={{ color: 'var(--text)', fontWeight: 500 }}>Send</span> when you're
          done speaking — we'll transcribe and drop it in your message.
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--destructive)',
          fontSize: 12,
          fontWeight: 500,
          fontVariantNumeric: 'tabular-nums',
          padding: '0 8px',
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--destructive)' }} />
        {formatElapsed(elapsedMs)}
      </div>
      <Button variant="ghost" leadingIcon="x" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="primary" leadingIcon="check" onClick={onSend}>
        Send
      </Button>
    </div>
  );
}
