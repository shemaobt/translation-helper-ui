import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { Icon } from '../components/Icon';
import { Alert, Button, Input } from '../components/primitives';
import { AuthShell } from '../components/shells';
import { useAuthStore } from '../lib/stores/authStore';

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const forgotPassword = useAuthStore((s) => s.forgotPassword);

  if (sent) return <SentState email={email} onBack={() => navigate('/login')} />;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      alert={
        error ? (
          <Alert variant="destructive" title="Could not send reset link">
            {error}
          </Alert>
        ) : undefined
      }
    >
      <div className="tw-h2" style={{ marginBottom: 6 }}>
        Reset your password.
      </div>
      <div className="tw-small" style={{ color: 'var(--text-2)', marginBottom: 24 }}>
        Enter your email and we'll send you a link.
      </div>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leadingIcon="mail"
          placeholder="you@translation.org"
          autoComplete="email"
          required
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          leadingIcon="mail"
          fullWidth
          disabled={submitting}
        >
          {submitting ? 'Sending…' : 'Send reset link'}
        </Button>
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <Button variant="ghost" leadingIcon="chevron-left" onClick={() => navigate('/login')}>
            Back to sign in
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}

function SentState({ email, onBack }: { email: string; onBack: () => void }) {
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
            border: '1px solid color-mix(in oklab, var(--success) 24%, transparent)',
          }}
        >
          <Icon name="mail" size={24} strokeWidth={1.6} />
        </div>
        <div className="tw-h2">Check your email.</div>
        <div className="tw-small" style={{ color: 'var(--text-2)', maxWidth: 320 }}>
          If an account exists, we sent a reset link to{' '}
          <span style={{ color: 'var(--text)', fontWeight: 500 }}>{email || 'you'}</span>.
        </div>
        <Button variant="ghost" leadingIcon="chevron-left" style={{ marginTop: 10 }} onClick={onBack}>
          Back to sign in
        </Button>
      </div>
    </AuthShell>
  );
}
