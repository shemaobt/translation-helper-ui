import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { audioApi } from '../../lib/api';
import { useToast } from '../../lib/hooks/useToast';
import { IconButton } from '../primitives';

interface MessageActionsProps {
  copyText?: string;
}

export function MessageActions({ copyText }: MessageActionsProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

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

  const stopPlayback = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPlaying(false);
  };

  const onSpeak = async () => {
    if (playing) {
      stopPlayback();
      return;
    }
    if (!copyText || copyText.trim().length === 0) {
      toast.show({ title: t('chat.nothingToReadAloud'), variant: 'info' });
      return;
    }
    try {
      setPlaying(true);
      const { audio_base64, mime_type } = await audioApi.speak(copyText.slice(0, 4500));
      const bin = atob(audio_base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime_type || 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = stopPlayback;
      audio.onerror = () => {
        toast.show({ title: t('chat.playbackFailed'), variant: 'error' });
        stopPlayback();
      };
      await audio.play();
    } catch (e) {
      const message = e instanceof Error ? e.message : t('chat.readAloudFailed');
      toast.show({ title: t('chat.readAloudFailed'), variant: 'error', body: message });
      stopPlayback();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12 }}>
      <IconButton icon="copy" size={32} iconSize={13} aria-label={t('chat.copy')} onClick={onCopy} />
      <IconButton
        icon={playing ? 'mic-off' : 'volume-2'}
        size={32}
        iconSize={13}
        aria-label={playing ? t('chat.stopReading') : t('chat.readAloud')}
        onClick={() => void onSpeak()}
      />
      <IconButton
        icon="refresh"
        size={32}
        iconSize={13}
        aria-label={t('chat.regenerate')}
        onClick={() => toast.show({ title: t('chat.regenerateComingSoon') })}
      />
    </div>
  );
}
