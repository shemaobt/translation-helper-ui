import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { Alert, Button, Input } from '../components/primitives';
import { AuthShell } from '../components/shells';
import { useToast } from '../lib/hooks/useToast';
import { useAuthStore } from '../lib/stores/authStore';

interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialForm = (): SignupForm => ({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
});

export default function Signup() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const signup = useAuthStore((s) => s.signup);

  const patch = (key: keyof SignupForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }
    if (form.password.length < 8) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    setSubmitting(true);
    try {
      const { accessRequested } = await signup({
        email: form.email,
        password: form.password,
        display_name: `${form.firstName} ${form.lastName}`.trim() || undefined,
      });
      if (accessRequested) {
        toast.show({
          variant: 'success',
          title: t('auth.accountCreated'),
          body: t('auth.accountCreatedSuccessBody'),
        });
        navigate('/login?status=pending');
      } else {
        toast.show({
          variant: 'warning',
          title: t('auth.accountCreated'),
          body: t('auth.accountCreatedWarningBody'),
        });
        navigate('/login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.couldNotCreate'));
    } finally {
      setSubmitting(false);
    }
  };

  const alert = error ? (
    <Alert variant="destructive" title={t('auth.signupFailed')}>
      {error}
    </Alert>
  ) : undefined;

  return (
    <AuthShell alert={alert}>
      <div className="tw-h2" style={{ marginBottom: 6 }}>
        {t('auth.createYourAccount')}
      </div>
      <div className="tw-small" style={{ color: 'var(--text-2)', marginBottom: 24 }}>
        {t('auth.fewDetailsToSetUp')}
      </div>

      <form
        onSubmit={onSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Input
            label={t('auth.firstName')}
            placeholder={t('auth.firstNamePlaceholder')}
            autoComplete="given-name"
            value={form.firstName}
            onChange={(e) => patch('firstName', e.currentTarget.value)}
            disabled={submitting}
            required
          />
          <Input
            label={t('auth.lastName')}
            placeholder={t('auth.lastNamePlaceholder')}
            autoComplete="family-name"
            value={form.lastName}
            onChange={(e) => patch('lastName', e.currentTarget.value)}
            disabled={submitting}
            required
          />
        </div>
        <Input
          label={t('auth.email')}
          type="email"
          placeholder={t('auth.emailPlaceholder')}
          leadingIcon="mail"
          autoComplete="email"
          value={form.email}
          onChange={(e) => patch('email', e.currentTarget.value)}
          disabled={submitting}
          required
        />
        <Input
          label={t('auth.password')}
          type="password"
          placeholder={t('auth.passwordCreatePlaceholder')}
          leadingIcon="lock"
          hint={t('auth.passwordHint')}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => patch('password', e.currentTarget.value)}
          disabled={submitting}
          required
        />
        <Input
          label={t('auth.confirmPassword')}
          type="password"
          placeholder={t('auth.confirmPasswordPlaceholder')}
          leadingIcon="lock"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={(e) => patch('confirmPassword', e.currentTarget.value)}
          disabled={submitting}
          required
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          disabled={submitting}
          style={{ marginTop: 8 }}
        >
          {submitting ? t('auth.creatingAccount') : t('auth.createAccount')}
        </Button>
      </form>

      <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
        <div className="tw-small" style={{ textAlign: 'center', color: 'var(--text-2)' }}>
          {t('auth.alreadyHaveAccount')}{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>
            {t('auth.signIn')}
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
