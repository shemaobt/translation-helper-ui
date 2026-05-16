import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Icon } from '../components/Icon';
import { Alert, Button, Input, Streaming } from '../components/primitives';
import { AuthShell } from '../components/shells';
import { useAuthStore } from '../lib/stores/authStore';

type State = 'form' | 'invalid' | 'success';

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get('token') ?? '';
  const initialState: State = params.get('state') === 'invalid' || !token ? 'invalid' : 'form';
  const [state, setState] = useState<State>(initialState);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const reset = useAuthStore((s) => s.resetPassword);

  useEffect(() => {
    if (state === 'success') {
      const t = setTimeout(() => navigate('/login?status=reset'), 1500);
      return () => clearTimeout(t);
    }
  }, [state, navigate]);

  if (state === 'invalid') {
    return (
      <InvalidState
        onRetry={() => navigate('/forgot-password')}
        onSignIn={() => navigate('/login')}
      />
    );
  }
  if (state === 'success') return <SuccessState />;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await reset(token, password);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      alert={
        error ? (
          <Alert variant="destructive" title="Reset failed">
            {error}
          </Alert>
        ) : undefined
      }
    >
      <div className="tw-h2" style={{ marginBottom: 6 }}>
        Set a new password.
      </div>
      <div className="tw-small" style={{ color: 'var(--text-2)', marginBottom: 24 }}>
        Choose something you haven't used before.
      </div>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="New password"
          type="password"
          leadingIcon="lock"
          hint="At least 8 characters."
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          required
          autoComplete="new-password"
        />
        <Input
          label="Confirm new password"
          type="password"
          leadingIcon="lock"
          placeholder="Re-enter password"
          value={confirm}
          onChange={(e) => setConfirm(e.currentTarget.value)}
          required
          autoComplete="new-password"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          leadingIcon="key"
          fullWidth
          disabled={submitting}
        >
          {submitting ? 'Updating…' : 'Reset password'}
        </Button>
      </form>
    </AuthShell>
  );
}

function InvalidState({ onRetry, onSignIn }: { onRetry: () => void; onSignIn: () => void }) {
  return (
    <AuthShell
      alert={
        <Alert variant="destructive" title="This reset link is invalid or has expired.">
          Reset links are good for 1 hour.
        </Alert>
      }
    >
      <div className="tw-h2" style={{ marginBottom: 6 }}>
        Reset your password.
      </div>
      <div className="tw-small" style={{ color: 'var(--text-2)', marginBottom: 24 }}>
        You'll need a fresh link to continue.
      </div>
      <Button variant="primary" size="md" leadingIcon="refresh" fullWidth onClick={onRetry}>
        Request a new link
      </Button>
      <div style={{ textAlign: 'center', marginTop: 14 }}>
        <Button variant="ghost" onClick={onSignIn}>
          Back to sign in
        </Button>
      </div>
    </AuthShell>
  );
}

function SuccessState() {
  return (
    <AuthShell>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          padding: '8px 0',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 18,
            background: 'var(--success-soft)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="check" size={26} strokeWidth={2.4} />
        </div>
        <div className="tw-h2">Password updated.</div>
        <div className="tw-small" style={{ color: 'var(--text-2)' }}>
          Redirecting to sign in…
        </div>
        <span style={{ color: 'var(--text-3)', marginTop: 4 }}>
          <Streaming />
        </span>
      </div>
    </AuthShell>
  );
}
