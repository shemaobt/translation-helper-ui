import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ToastVariant } from '../../components/primitives/Toast';

export interface ToastOptions {
  title: ReactNode;
  body?: ReactNode;
  variant?: ToastVariant;
  durationMs?: number;
}

export interface ToastEntry extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toasts: ToastEntry[];
  show: (opts: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_QUEUE = 3;
const DEFAULT_MS = 3000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((q) => q.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (opts: ToastOptions) => {
      const id = `t-${Date.now()}-${counter.current++}`;
      setToasts((q) => [...q, { ...opts, id }].slice(-MAX_QUEUE));
      window.setTimeout(() => dismiss(id), opts.durationMs ?? DEFAULT_MS);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(() => ({ toasts, show, dismiss }), [toasts, show, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
