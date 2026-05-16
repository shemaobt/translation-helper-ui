import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Agent } from '../../lib/agents';
import { audioApi } from '../../lib/api';
import type { InputState } from '../../lib/hooks/useChat';
import { useIsMobile } from '../../lib/hooks/useIsMobile';
import { useToast } from '../../lib/hooks/useToast';
import { useVoiceRecorder } from '../../lib/hooks/useVoiceRecorder';
import { Icon } from '../Icon';
import { Alert, IconButton } from '../primitives';
import { VoiceTakeover } from './VoiceTakeover';

interface MainInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend?: (v: string) => void;
  onMicClick?: () => void;
  onMicStateChange?: (state: InputState) => void;
  state: InputState;
  agent?: Agent;
  onAgentClick?: () => void;
  showHint?: boolean;
}

export function MainInput({
  value,
  onChange,
  onSend,
  onMicClick,
  onMicStateChange,
  state,
  agent,
  onAgentClick,
  showHint,
}: MainInputProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const toast = useToast();
  const isMobile = useIsMobile();
  const recorder = useVoiceRecorder();
  const onAttach = () => toast.show({ title: 'Attachments — coming soon' });

  useEffect(() => {
    if (recorder.error) {
      setLocalError(recorder.error);
      onMicStateChange?.('error');
    }
  }, [recorder.error, onMicStateChange]);

  const startListening = async () => {
    setLocalError(null);
    await recorder.start();
    if (!recorder.error) {
      onMicStateChange?.('listening');
      onMicClick?.();
    }
  };

  const finishAndTranscribe = async () => {
    const blob = await recorder.stop();
    onMicStateChange?.('idle');
    onMicClick?.();
    if (!blob) {
      toast.show({ title: 'No audio captured' });
      return;
    }
    setTranscribing(true);
    try {
      const { text } = await audioApi.transcribeAudio(blob);
      const trimmed = text.trim();
      const next = value ? `${value} ${trimmed}` : trimmed;
      onChange(next);
      toast.show({ variant: 'success', title: 'Transcribed' });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Transcription failed';
      setLocalError(message);
      toast.show({ variant: 'error', title: 'Transcription failed', body: message });
    } finally {
      setTranscribing(false);
    }
  };

  const cancelListening = () => {
    recorder.cancel();
    onMicStateChange?.('idle');
    onMicClick?.();
  };

  if (recorder.recording) {
    return (
      <VoiceTakeover
        elapsedMs={recorder.elapsedMs}
        onCancel={cancelListening}
        onSend={() => void finishAndTranscribe()}
      />
    );
  }

  const hasContent = value.trim().length > 0;
  const showFocus = focused || hasContent;
  const isError = state === 'error' || !!localError;

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (hasContent) onSend?.(value);
    }
  };

  return (
    <div>
      <div
        style={{
          background: 'var(--paper)',
          border: `1px solid ${showFocus ? 'var(--accent)' : 'var(--border-subtle)'}`,
          borderRadius: 22,
          boxShadow: showFocus
            ? '0 0 0 4px var(--accent-ring), var(--shadow-sm)'
            : 'var(--shadow-sm)',
          padding: '6px 6px 8px',
          transition: 'box-shadow 200ms ease-out, border-color 200ms ease-out',
        }}
      >
        {isError && (
          <div style={{ margin: 10 }}>
            <Alert variant="destructive" title="Voice input error">
              {localError ?? 'Enable mic permissions in your browser settings.'}
            </Alert>
          </div>
        )}

        <div
          style={{
            padding: isMobile ? '12px 14px 8px' : '16px 18px 12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: isMobile ? 10 : 14,
            minHeight: 52,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: 'var(--surface-2)',
              color: 'var(--text-3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: '0 0 auto',
            }}
          >
            <Icon name="message-circle" size={15} />
          </div>
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKey}
            placeholder={transcribing ? 'Transcribing your voice…' : 'What can I do for you today?'}
            rows={1}
            disabled={transcribing}
            style={{
              flex: 1,
              alignSelf: 'center',
              fontSize: 15,
              lineHeight: 1.5,
              color: 'var(--text)',
              border: 0,
              outline: 'none',
              background: 'transparent',
              resize: 'none',
              fontFamily: 'inherit',
              maxHeight: 240,
            }}
          />
        </div>

        <hr
          style={{ border: 0, borderTop: '1px solid var(--border-faint)', margin: '0 6px' }}
        />

        <div
          style={{ display: 'flex', alignItems: 'center', padding: '10px 8px 6px', gap: 6 }}
        >
          <IconButton
            icon="plus"
            variant="soft"
            hoverFill={false}
            aria-label="Add attachment"
            onClick={onAttach}
          />
          <IconButton
            icon={isError ? 'mic-off' : 'mic'}
            onClick={() => void startListening()}
            destructive={isError}
            aria-label="Voice input"
          />
          <div style={{ flex: 1 }} />
          {agent && (
            <button
              onClick={onAgentClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 12px',
                height: 32,
                maxWidth: isMobile ? 140 : 'none',
                borderRadius: 999,
                background: 'var(--surface-2)',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              title={agent.name}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.name}</span>
              <Icon
                name="chevron-down"
                size={13}
                style={{ color: 'var(--text-3)', flex: '0 0 auto' }}
              />
            </button>
          )}
          {!isMobile && (
            <IconButton
              icon="paperclip"
              aria-label="Attach file"
              iconSize={15}
              onClick={onAttach}
            />
          )}
          <button
            aria-label="Send"
            disabled={!hasContent || transcribing}
            onClick={() => hasContent && onSend?.(value)}
            className="tw-focusable"
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: hasContent ? 'var(--accent)' : 'var(--pill-active)',
              color: hasContent ? 'var(--on-accent)' : 'var(--pill-active-fg)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: hasContent ? 'var(--shadow-sm)' : 'none',
              cursor: hasContent ? 'pointer' : 'default',
              opacity: hasContent ? 1 : 0.7,
              border: 0,
            }}
          >
            <Icon name="arrow-up" size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>
      {showHint && (
        <div
          className="tw-micro"
          style={{ color: 'var(--text-4)', textAlign: 'center', marginTop: 10 }}
        >
          Enter to send · Shift+Enter for newline
        </div>
      )}
    </div>
  );
}
