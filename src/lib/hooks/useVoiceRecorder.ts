import { useCallback, useEffect, useRef, useState } from 'react';

interface State {
  recording: boolean;
  elapsedMs: number;
  error: string | null;
}

interface Hook extends State {
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  cancel: () => void;
}

export function useVoiceRecorder(): Hook {
  const [state, setState] = useState<State>({ recording: false, elapsedMs: 0, error: null });
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  const start = useCallback(async () => {
    if (recorderRef.current) return;
    setState({ recording: false, elapsedMs: 0, error: null });
    if (!navigator.mediaDevices?.getUserMedia) {
      setState((s) => ({ ...s, error: 'Microphone API not available' }));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setState({ recording: true, elapsedMs: 0, error: null });
      timerRef.current = window.setInterval(() => {
        setState((s) => ({ ...s, elapsedMs: Date.now() - startedAtRef.current }));
      }, 250);
    } catch (e) {
      setState((s) => ({
        ...s,
        error: e instanceof Error ? e.message : 'Microphone access denied',
      }));
    }
  }, []);

  const finalize = useCallback((): Blob | null => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    if (chunksRef.current.length === 0) return null;
    const type = chunksRef.current[0].type || 'audio/webm';
    return new Blob(chunksRef.current, { type });
  }, []);

  const stop = useCallback(
    () =>
      new Promise<Blob | null>((resolve) => {
        const rec = recorderRef.current;
        if (!rec) {
          resolve(null);
          return;
        }
        rec.onstop = () => {
          const blob = finalize();
          setState((s) => ({ ...s, recording: false }));
          resolve(blob);
        };
        rec.stop();
      }),
    [finalize],
  );

  const cancel = useCallback(() => {
    const rec = recorderRef.current;
    if (rec) {
      rec.onstop = () => {
        finalize();
        chunksRef.current = [];
      };
      rec.stop();
    }
    setState({ recording: false, elapsedMs: 0, error: null });
  }, [finalize]);

  return { ...state, start, stop, cancel };
}
