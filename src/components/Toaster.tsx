import { useToast } from '../lib/hooks/useToast';
import { Toast } from './primitives';

export function Toaster() {
  const { toasts } = useToast();
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <Toast variant={t.variant} title={t.title} body={t.body} />
        </div>
      ))}
    </div>
  );
}
