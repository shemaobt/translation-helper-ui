import { Trans, useTranslation } from 'react-i18next';
import { Icon } from '../Icon';
import { Button } from '../primitives';

interface VoiceTakeoverProps {
  elapsedMs?: number;
  approachingLimit?: boolean;
  maxDurationMs?: number;
  onCancel?: () => void;
  onSend?: () => void;
}

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VoiceTakeover({
  elapsedMs = 0,
  approachingLimit = false,
  maxDurationMs,
  onCancel,
  onSend,
}: VoiceTakeoverProps) {
  const { t } = useTranslation();
  const limitLabel = maxDurationMs ? formatElapsed(maxDurationMs) : null;
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
          {t('chat.listening')}
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
          <Trans
            i18nKey="chat.tapSendWhenDone"
            components={{ strong: <span style={{ color: 'var(--text)', fontWeight: 500 }} /> }}
          />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 2,
          color: approachingLimit ? 'var(--destructive)' : 'var(--text-2)',
          fontSize: 12,
          fontWeight: 500,
          fontVariantNumeric: 'tabular-nums',
          padding: '0 8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: approachingLimit ? 'var(--destructive)' : 'var(--accent)',
            }}
          />
          {formatElapsed(elapsedMs)}
        </div>
        {approachingLimit && limitLabel && (
          <div style={{ fontSize: 10 }}>{t('chat.stoppingAt', { time: limitLabel })}</div>
        )}
      </div>
      <Button variant="ghost" leadingIcon="x" onClick={onCancel}>
        {t('common.cancel')}
      </Button>
      <Button variant="primary" leadingIcon="check" onClick={onSend}>
        {t('chat.send')}
      </Button>
    </div>
  );
}
