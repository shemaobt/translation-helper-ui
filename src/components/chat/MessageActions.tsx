import { useEffect, useRef, useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { audioApi } from '../../lib/api';
import { ttsLanguageCode } from '../../lib/api/audio';
import type { Timepoint } from '../../lib/api/types';
import { useKaraokeHighlight } from '../../lib/hooks/useKaraokeHighlight';
import { useToast } from '../../lib/hooks/useToast';
import { stripMarkdownForSpeech } from '../../lib/text/stripMarkdownForSpeech';
import { Icon } from '../Icon';
import { IconButton, Spinner, Tooltip } from '../primitives';

interface MessageActionsProps {
  copyText?: string;
  contentRef?: RefObject<HTMLElement | null>;
}

type PlaybackState = 'idle' | 'loading' | 'playing';

export function MessageActions({ copyText, contentRef }: MessageActionsProps) {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [state, setState] = useState<PlaybackState>('idle');
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);
  const [activeSpoken, setActiveSpoken] = useState('');
  const [activeTimepoints, setActiveTimepoints] = useState<Timepoint[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const fallbackRef = useRef<HTMLElement | null>(null);
  useKaraokeHighlight({
    containerRef: contentRef ?? fallbackRef,
    spokenText: activeSpoken,
    timepoints: activeTimepoints,
    audio: activeAudio,
  });

  useEffect(
    () => () => {
      audioRef.current?.pause();
      audioRef.current = null;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    },
    [],
  );

  const onCopy = async () => {
    if (!copyText) {
      toast.show({ title: t('chat.nothingToCopy'), variant: 'info' });
      return;
    }
    try {
      await navigator.clipboard?.writeText(copyText);
      toast.show({ title: t('chat.copied'), variant: 'success' });
    } catch {
      toast.show({ title: t('chat.couldntCopy'), variant: 'error' });
    }
  };

  const teardown = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setActiveAudio(null);
    setActiveTimepoints([]);
    setActiveSpoken('');
    setState('idle');
  };

  const onListen = async () => {
    if (state === 'playing') {
      teardown();
      return;
    }
    if (state === 'loading') return;

    const spoken = stripMarkdownForSpeech(copyText ?? '');
    if (!spoken) {
      toast.show({ title: t('chat.nothingToReadAloud'), variant: 'info' });
      return;
    }

    setState('loading');
    try {
      const spokenClipped = spoken.slice(0, 4500);
      const { audio_base64, mime_type, timepoints } = await audioApi.speak(
        spokenClipped,
        ttsLanguageCode(i18n.language),
      );
      const bin = atob(audio_base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime_type || 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = teardown;
      audio.onerror = () => {
        toast.show({ title: t('chat.playbackFailed'), variant: 'error' });
        teardown();
      };
      await audio.play();
      setActiveSpoken(spokenClipped);
      setActiveTimepoints(timepoints ?? []);
      setActiveAudio(audio);
      setState('playing');
    } catch (e) {
      const message = e instanceof Error ? e.message : t('chat.readAloudFailed');
      toast.show({ title: t('chat.readAloudFailed'), variant: 'error', body: message });
      teardown();
    }
  };

  const isPlaying = state === 'playing';
  const isLoading = state === 'loading';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
      <Tooltip label={t('chat.copy')}>
        <IconButton icon="copy" size={32} iconSize={13} aria-label={t('chat.copy')} onClick={onCopy} />
      </Tooltip>

      <button
        onClick={() => void onListen()}
        disabled={isLoading}
        aria-label={isPlaying ? t('chat.stopReading') : t('chat.readAloud')}
        aria-pressed={isPlaying}
        className={isPlaying ? 'tw-listen-pulse tw-focusable' : 'tw-focusable'}
        style={{
          height: 32,
          minWidth: 96,
          padding: '0 12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          background: 'color-mix(in oklab, var(--accent) 12%, transparent)',
          color: 'var(--accent)',
          border: '1px solid color-mix(in oklab, var(--accent) 28%, transparent)',
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 500,
          cursor: isLoading ? 'wait' : 'pointer',
          transition: 'background 160ms ease-out, border-color 160ms ease-out, color 160ms ease-out',
          opacity: isLoading ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (isLoading) return;
          e.currentTarget.style.background = 'color-mix(in oklab, var(--accent) 18%, transparent)';
        }}
        onMouseLeave={(e) => {
          if (isLoading) return;
          e.currentTarget.style.background = 'color-mix(in oklab, var(--accent) 12%, transparent)';
        }}
      >
        {isLoading ? (
          <Spinner size="xs" tone="inherit" />
        ) : isPlaying ? (
          <Icon name="mic-off" size={13} strokeWidth={2} />
        ) : (
          <Icon name="volume-2" size={13} strokeWidth={2} />
        )}
        <span>{isLoading ? t('chat.preparingAudio') : isPlaying ? t('chat.stop') : t('chat.listen')}</span>
      </button>

      <Tooltip label={t('chat.regenerate')}>
        <IconButton
          icon="refresh"
          size={32}
          iconSize={13}
          aria-label={t('chat.regenerate')}
          onClick={() => toast.show({ title: t('chat.regenerateComingSoon') })}
        />
      </Tooltip>
    </div>
  );
}
