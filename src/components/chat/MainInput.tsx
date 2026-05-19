import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AGENTS, type Agent, type AgentId } from '../../lib/agents';
import { audioApi } from '../../lib/api';
import { useClickOutside } from '../../lib/hooks/useClickOutside';
import type { InputState } from '../../lib/hooks/useChat';
import { useIsMobile } from '../../lib/hooks/useIsMobile';
import { useToast } from '../../lib/hooks/useToast';
import { useVoiceRecorder } from '../../lib/hooks/useVoiceRecorder';
import { Icon, type IconName } from '../Icon';
import { Alert, IconButton } from '../primitives';
import { VoiceTakeover } from './VoiceTakeover';

function isPermissionDenied(message: string | null): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes('denied') ||
    m.includes('permission') ||
    m.includes('notallowed') ||
    m.includes('not allowed')
  );
}

interface MainInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend?: (v: string) => void;
  onMicClick?: () => void;
  onMicStateChange?: (state: InputState) => void;
  state: InputState;
  agent?: Agent;
  onAgentSelect?: (id: AgentId) => void;
  showHint?: boolean;
  /** True while the previous assistant turn is still streaming. Locks the whole input. */
  disabled?: boolean;
}

export function MainInput({
  value,
  onChange,
  onSend,
  onMicClick,
  onMicStateChange,
  state,
  agent,
  onAgentSelect,
  showHint,
  disabled = false,
}: MainInputProps) {
  const { t } = useTranslation();
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [agentPickerOpen, setAgentPickerOpen] = useState(false);
  const agentPickerRef = useRef<HTMLDivElement>(null);
  useClickOutside(agentPickerRef, () => setAgentPickerOpen(false), agentPickerOpen);
  const toast = useToast();
  const isMobile = useIsMobile();

  const transcribeBlob = async (blob: Blob | null) => {
    onMicStateChange?.('idle');
    onMicClick?.();
    if (!blob) {
      toast.show({ title: t('chat.noAudioCaptured') });
      return;
    }
    setTranscribing(true);
    try {
      const { text } = await audioApi.transcribeAudio(blob);
      const trimmed = text.trim();
      const next = value ? `${value} ${trimmed}` : trimmed;
      onChange(next);
      toast.show({ variant: 'success', title: t('chat.transcribed') });
    } catch (e) {
      const message = e instanceof Error ? e.message : t('chat.transcriptionFailed');
      setLocalError(message);
      toast.show({ variant: 'error', title: t('chat.transcriptionFailed'), body: message });
    } finally {
      setTranscribing(false);
    }
  };

  const recorder = useVoiceRecorder({
    onAutoStop: (blob) => {
      toast.show({
        title: t('chat.recordingLimitReached'),
        body: t('chat.recordingLimitReachedBody'),
      });
      void transcribeBlob(blob);
    },
  });
  const onAttach = () => toast.show({ title: t('chat.attachmentsComingSoon') });

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
    await transcribeBlob(blob);
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
        approachingLimit={recorder.approachingLimit}
        maxDurationMs={recorder.maxDurationMs}
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
      if (hasContent && !disabled) onSend?.(value);
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
            <Alert variant="destructive" title={t('chat.voiceInputError')}>
              {localError ?? t('chat.voiceInputErrorBody')}
              {isPermissionDenied(localError) && (
                <div style={{ marginTop: 6, color: 'var(--text-2)' }}>
                  {t('chat.voiceInputDeniedTip')}
                </div>
              )}
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
            placeholder={
              disabled
                ? t('chat.generatingResponse')
                : transcribing
                  ? t('chat.transcribingPlaceholder')
                  : t('chat.inputPlaceholder')
            }
            rows={1}
            disabled={transcribing || disabled}
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
            aria-label={t('chat.addAttachment')}
            onClick={onAttach}
            disabled={disabled}
          />
          <IconButton
            icon={isError ? 'mic-off' : 'mic'}
            onClick={() => void startListening()}
            destructive={isError}
            aria-label={t('chat.voiceInput')}
            disabled={disabled}
          />
          <div style={{ flex: 1 }} />
          {agent && (
            <div ref={agentPickerRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setAgentPickerOpen((o) => !o)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setAgentPickerOpen(false);
                }}
                aria-haspopup="listbox"
                aria-expanded={agentPickerOpen}
                aria-label={t('chat.changeAssistant', { defaultValue: 'Change assistant' })}
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
              {agentPickerOpen && (
                <div
                  role="listbox"
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    right: 0,
                    width: isMobile ? 260 : 320,
                    maxWidth: 'calc(100vw - 24px)',
                    background: 'var(--paper)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 14,
                    boxShadow: 'var(--shadow-md)',
                    padding: 6,
                    zIndex: 20,
                  }}
                >
                  {AGENTS.map((a) => {
                    const active = a.id === agent.id;
                    return (
                      <button
                        key={a.id}
                        role="option"
                        aria-selected={active}
                        type="button"
                        onClick={() => {
                          onAgentSelect?.(a.id);
                          setAgentPickerOpen(false);
                        }}
                        className="tw-hover-surface"
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '8px 10px',
                          borderRadius: 10,
                          width: '100%',
                          textAlign: 'left',
                          background: active ? 'var(--surface-2)' : 'transparent',
                          color: 'var(--text)',
                          border: 0,
                          cursor: 'pointer',
                        }}
                      >
                        <Icon
                          name={a.icon as IconName}
                          size={16}
                          style={{ color: 'var(--text-3)', marginTop: 2, flex: '0 0 auto' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div>
                          <div className="tw-micro" style={{ color: 'var(--text-3)', marginTop: 2 }}>
                            {a.short}
                          </div>
                        </div>
                        {active && (
                          <Icon
                            name="check"
                            size={14}
                            style={{ color: 'var(--accent)', flex: '0 0 auto', marginTop: 3 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {!isMobile && (
            <IconButton
              icon="paperclip"
              aria-label={t('chat.attachFile')}
              iconSize={15}
              onClick={onAttach}
              disabled={disabled}
            />
          )}
          <button
            aria-label={t('chat.send')}
            disabled={!hasContent || transcribing || disabled}
            onClick={() => hasContent && !disabled && onSend?.(value)}
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
          {t('chat.enterToSend')}
        </div>
      )}
    </div>
  );
}
