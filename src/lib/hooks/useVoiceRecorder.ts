import { useCallback, useEffect, useRef, useState } from 'react';

interface State {
  recording: boolean;
  elapsedMs: number;
  error: string | null;
  approachingLimit: boolean;
}

interface Hook extends State {
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  cancel: () => void;
  maxDurationMs: number;
}

interface UseVoiceRecorderOptions {
  /** Hard cap on recording length. Default: 5 minutes. */
  maxDurationMs?: number;
  /** Soft-warning threshold; sets `approachingLimit` once crossed. Default: 4:30. */
  warningAtMs?: number;
  /** Called once when the hard cap auto-stops the recording. */
  onAutoStop?: (blob: Blob | null) => void;
}

const DEFAULT_MAX_MS = 5 * 60 * 1000;
const DEFAULT_WARN_MS = 4 * 60 * 1000 + 30 * 1000;

export function useVoiceRecorder(opts: UseVoiceRecorderOptions = {}): Hook {
  const maxDurationMs = opts.maxDurationMs ?? DEFAULT_MAX_MS;
  const warningAtMs = opts.warningAtMs ?? DEFAULT_WARN_MS;
  const onAutoStopRef = useRef(opts.onAutoStop);
  onAutoStopRef.current = opts.onAutoStop;

  const [state, setState] = useState<State>({
    recording: false,
    elapsedMs: 0,
    error: null,
    approachingLimit: false,
  });
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const autoStopFiredRef = useRef(false);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

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
          setState((s) => ({ ...s, recording: false, approachingLimit: false }));
          resolve(blob);
        };
        rec.stop();
      }),
    [finalize],
  );

  const start = useCallback(async () => {
    if (recorderRef.current) return;
    autoStopFiredRef.current = false;
    setState({
      recording: false,
      elapsedMs: 0,
      error: null,
      approachingLimit: false,
    });
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
      setState({
        recording: true,
        elapsedMs: 0,
        error: null,
        approachingLimit: false,
      });
      timerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startedAtRef.current;
        setState((s) => ({
          ...s,
          elapsedMs: elapsed,
          approachingLimit: elapsed >= warningAtMs,
        }));
        if (elapsed >= maxDurationMs && !autoStopFiredRef.current) {
          autoStopFiredRef.current = true;
          void stop().then((blob) => onAutoStopRef.current?.(blob));
        }
      }, 250);
    } catch (e) {
      setState((s) => ({
        ...s,
        error: e instanceof Error ? e.message : 'Microphone access denied',
      }));
    }
  }, [maxDurationMs, warningAtMs, stop]);

  const cancel = useCallback(() => {
    const rec = recorderRef.current;
    if (rec) {
      rec.onstop = () => {
        finalize();
        chunksRef.current = [];
      };
      rec.stop();
    }
    setState({
      recording: false,
      elapsedMs: 0,
      error: null,
      approachingLimit: false,
    });
  }, [finalize]);

  return { ...state, start, stop, cancel, maxDurationMs };
}
