import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useSearch } from 'wouter';
import { Alert, Button, Input } from '../components/primitives';
import { AuthShell } from '../components/shells';
import { useToast } from '../lib/hooks/useToast';
import { useAuthStore } from '../lib/stores/authStore';

type StatusVariant = 'pending' | 'rejected' | 'approved' | 'reset';

const STATUS_ALERTS: Record<
  StatusVariant,
  { variant: 'warning' | 'destructive' | 'success'; titleKey: string; bodyKey: string }
> = {
  pending: {
    variant: 'warning',
    titleKey: 'auth.statusPendingTitle',
    bodyKey: 'auth.statusPendingBody',
  },
  rejected: {
    variant: 'destructive',
    titleKey: 'auth.statusRejectedTitle',
    bodyKey: 'auth.statusRejectedBody',
  },
  approved: {
    variant: 'success',
    titleKey: 'auth.statusApprovedTitle',
    bodyKey: 'auth.statusApprovedBody',
  },
  reset: {
    variant: 'success',
    titleKey: 'auth.statusResetTitle',
    bodyKey: 'auth.statusResetBody',
  },
};

const STATUSES = new Set<StatusVariant>(['pending', 'rejected', 'approved', 'reset']);

const parseStatus = (raw: string | null): StatusVariant | undefined => {
  if (!raw) return undefined;
  return STATUSES.has(raw as StatusVariant) ? (raw as StatusVariant) : undefined;
};

export default function Login() {
  const { t } = useTranslation();
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
    <Alert variant={STATUS_ALERTS[status].variant} title={t(STATUS_ALERTS[status].titleKey)}>
      {t(STATUS_ALERTS[status].bodyKey)}
    </Alert>
  ) : error ? (
    <Alert variant="destructive" title={t('auth.signinFailed')}>
      {error}
    </Alert>
  ) : undefined;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      toast.show({ variant: 'success', title: t('auth.welcomeBack') });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.invalidCredentials'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell alert={alert}>
      <div className="tw-h2" style={{ marginBottom: 6 }}>
        {t('auth.welcomeBack')}
      </div>
      <div className="tw-small" style={{ color: 'var(--text-2)', marginBottom: 24 }}>
        {t('auth.signInSubtitle')}
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label={t('auth.email')}
          type="email"
          placeholder={t('auth.emailPlaceholder')}
          leadingIcon="mail"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          disabled={submitting}
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
            <label style={{ fontSize: 13, fontWeight: 500 }}>{t('auth.password')}</label>
            <Link
              href="/forgot-password"
              style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}
            >
              {t('auth.forgot')}
            </Link>
          </div>
          <Input
            type={showPw ? 'text' : 'password'}
            placeholder={t('auth.passwordPlaceholder')}
            leadingIcon="lock"
            trailingIcon="x"
            onTrailingClick={() => setShowPw((v) => !v)}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            disabled={submitting}
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
          {submitting ? t('auth.signingIn') : t('auth.signIn')}
        </Button>

        <Divider label={t('auth.newHere')} />

        <Button
          type="button"
          variant="secondary"
          size="md"
          fullWidth
          trailingIcon="arrow-right"
          onClick={() => navigate('/signup')}
        >
          {t('auth.createAccount')}
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
