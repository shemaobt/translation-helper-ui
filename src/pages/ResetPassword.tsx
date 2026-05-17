import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearch } from 'wouter';
import { Icon } from '../components/Icon';
import { Alert, Button, Input, Streaming } from '../components/primitives';
import { AuthShell } from '../components/shells';
import { useAuthStore } from '../lib/stores/authStore';

type State = 'form' | 'invalid' | 'success';

export default function ResetPassword() {
  const { t } = useTranslation();
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
      const timer = setTimeout(() => navigate('/login?status=reset'), 1500);
      return () => clearTimeout(timer);
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
      setError(t('auth.passwordTooShort'));
      return;
    }
    if (password !== confirm) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }
    setSubmitting(true);
    try {
      await reset(token, password);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.resetGenericError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      alert={
        error ? (
          <Alert variant="destructive" title={t('auth.resetFailed')}>
            {error}
          </Alert>
        ) : undefined
      }
    >
      <div className="tw-h2" style={{ marginBottom: 6 }}>
        {t('auth.setNewPassword')}
      </div>
      <div className="tw-small" style={{ color: 'var(--text-2)', marginBottom: 24 }}>
        {t('auth.setNewPasswordSubtitle')}
      </div>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label={t('auth.newPassword')}
          type="password"
          leadingIcon="lock"
          hint={t('auth.passwordHint')}
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          required
          autoComplete="new-password"
        />
        <Input
          label={t('auth.confirmNewPassword')}
          type="password"
          leadingIcon="lock"
          placeholder={t('auth.confirmNewPasswordPlaceholder')}
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
          {submitting ? t('auth.updating') : t('auth.resetPasswordButton')}
        </Button>
      </form>
    </AuthShell>
  );
}

function InvalidState({ onRetry, onSignIn }: { onRetry: () => void; onSignIn: () => void }) {
  const { t } = useTranslation();
  return (
    <AuthShell
      alert={
        <Alert variant="destructive" title={t('auth.linkInvalidTitle')}>
          {t('auth.linkInvalidBody')}
        </Alert>
      }
    >
      <div className="tw-h2" style={{ marginBottom: 6 }}>
        {t('auth.resetPasswordTitle')}
      </div>
      <div className="tw-small" style={{ color: 'var(--text-2)', marginBottom: 24 }}>
        {t('auth.linkInvalidSubtitle')}
      </div>
      <Button variant="primary" size="md" leadingIcon="refresh" fullWidth onClick={onRetry}>
        {t('auth.requestNewLink')}
      </Button>
      <div style={{ textAlign: 'center', marginTop: 14 }}>
        <Button variant="ghost" onClick={onSignIn}>
          {t('auth.backToSignIn')}
        </Button>
      </div>
    </AuthShell>
  );
}

function SuccessState() {
  const { t } = useTranslation();
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
        <div className="tw-h2">{t('auth.passwordUpdated')}</div>
        <div className="tw-small" style={{ color: 'var(--text-2)' }}>
          {t('auth.redirectingSignIn')}
        </div>
        <span style={{ color: 'var(--text-3)', marginTop: 4 }}>
          <Streaming />
        </span>
      </div>
    </AuthShell>
  );
}
