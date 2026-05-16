import { useState, type FormEvent } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { Alert, Button, Input } from '../components/primitives';
import { AuthShell } from '../components/shells';
import { useToast } from '../lib/hooks/useToast';
import { useAuthStore } from '../lib/stores/authStore';

type StatusVariant = 'pending' | 'rejected' | 'approved' | 'reset';

const STATUS_ALERTS: Record<
  StatusVariant,
  { variant: 'warning' | 'destructive' | 'success'; title: string; body: string }
> = {
  pending: {
    variant: 'warning',
    title: 'Your account is awaiting admin approval.',
    body: "We'll email you when an admin reviews it.",
  },
  rejected: {
    variant: 'destructive',
    title: 'Your account request was not approved.',
    body: 'Please contact your administrator.',
  },
  approved: {
    variant: 'success',
    title: 'Your account has been approved.',
    body: 'Sign in below to continue.',
  },
  reset: {
    variant: 'success',
    title: 'Password reset successfully.',
    body: 'Sign in with your new password.',
  },
};

const STATUSES = new Set<StatusVariant>(['pending', 'rejected', 'approved', 'reset']);

const parseStatus = (raw: string | null): StatusVariant | undefined => {
  if (!raw) return undefined;
  return STATUSES.has(raw as StatusVariant) ? (raw as StatusVariant) : undefined;
};

export default function Login() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const status = parseStatus(new URLSearchParams(search).get('status'));
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const login = useAuthStore((s) => s.login);

  const alert = status ? (
    <Alert variant={STATUS_ALERTS[status].variant} title={STATUS_ALERTS[status].title}>
      {STATUS_ALERTS[status].body}
    </Alert>
  ) : error ? (
    <Alert variant="destructive" title="Sign-in failed">
      {error}
    </Alert>
  ) : undefined;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      toast.show({ variant: 'success', title: `Welcome back.` });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell alert={alert}>
      <div className="tw-h2" style={{ marginBottom: 6 }}>
        Welcome back.
      </div>
      <div className="tw-small" style={{ color: 'var(--text-2)', marginBottom: 24 }}>
        Sign in to continue your work.
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Email"
          type="email"
          placeholder="you@translation.org"
          leadingIcon="mail"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          required
        />
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <label style={{ fontSize: 13, fontWeight: 500 }}>Password</label>
            <Link
              href="/forgot-password"
              style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}
            >
              Forgot?
            </Link>
          </div>
          <Input
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            leadingIcon="lock"
            trailingIcon="x"
            onTrailingClick={() => setShowPw((v) => !v)}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={submitting}
          style={{ marginTop: 8 }}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>

        <Divider label="new here?" />

        <Button
          type="button"
          variant="secondary"
          size="md"
          fullWidth
          trailingIcon="arrow-right"
          onClick={() => navigate('/signup')}
        >
          Create an account
        </Button>
      </form>
    </AuthShell>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
      <div className="tw-micro" style={{ color: 'var(--text-3)' }}>
        {label}
      </div>
      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
    </div>
  );
}
