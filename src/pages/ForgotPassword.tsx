import { useState, type FormEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Icon } from '../components/Icon';
import { Alert, Button, Input } from '../components/primitives';
import { AuthShell } from '../components/shells';
import { useAuthStore } from '../lib/stores/authStore';

export default function ForgotPassword() {
  const { t } = useTranslation();
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
      setError(err instanceof Error ? err.message : t('auth.couldNotSendReset'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      alert={
        error ? (
          <Alert variant="destructive" title={t('auth.couldNotSendReset')}>
            {error}
          </Alert>
        ) : undefined
      }
    >
      <div className="tw-h2" style={{ marginBottom: 6 }}>
        {t('auth.resetPasswordTitle')}
      </div>
      <div className="tw-small" style={{ color: 'var(--text-2)', marginBottom: 24 }}>
        {t('auth.resetPasswordSubtitle')}
      </div>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label={t('auth.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leadingIcon="mail"
          placeholder={t('auth.emailPlaceholder')}
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
          {submitting ? t('auth.sendingResetLink') : t('auth.sendResetLink')}
        </Button>
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <Button variant="ghost" leadingIcon="chevron-left" onClick={() => navigate('/login')}>
            {t('auth.backToSignIn')}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}

function SentState({ email, onBack }: { email: string; onBack: () => void }) {
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
            border: '1px solid color-mix(in oklab, var(--success) 24%, transparent)',
          }}
        >
          <Icon name="mail" size={24} strokeWidth={1.6} />
        </div>
        <div className="tw-h2">{t('auth.checkYourEmail')}</div>
        <div className="tw-small" style={{ color: 'var(--text-2)', maxWidth: 320 }}>
          {email ? (
            <Trans
              i18nKey="auth.checkYourEmailBody"
              values={{ email }}
              components={{ 1: <span style={{ color: 'var(--text)', fontWeight: 500 }} /> }}
            />
          ) : (
            t('auth.checkYourEmailBodyFallback')
          )}
        </div>
        <Button variant="ghost" leadingIcon="chevron-left" style={{ marginTop: 10 }} onClick={onBack}>
          {t('auth.backToSignIn')}
        </Button>
      </div>
    </AuthShell>
  );
}
