import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { Icon } from '../components/Icon';
import { Alert, Button, Input, Select } from '../components/primitives';
import { AuthShell } from '../components/shells';
import { ROLE_OPTION_KEYS, type RoleOptionKey } from '../lib/agents';
import { useToast } from '../lib/hooks/useToast';
import { useAuthStore } from '../lib/stores/authStore';

interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organization: string;
  role: RoleOptionKey;
}

const initialForm = (): SignupForm => ({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  organization: '',
  role: ROLE_OPTION_KEYS[0],
});

export default function Signup() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const signup = useAuthStore((s) => s.signup);

  const onCreate = async () => {
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
      <ProgressBar step={step} />

      <div className="tw-h2" style={{ marginBottom: 6 }}>
        {step === 1 ? t('auth.createYourAccount') : t('auth.tellAboutYourWork')}
      </div>
      <div className="tw-small" style={{ color: 'var(--text-2)', marginBottom: 24 }}>
        {step === 1 ? t('auth.fewDetailsToSetUp') : t('auth.helpsUsTailor')}
      </div>

      {step === 1 ? (
        <AccountStep form={form} setForm={setForm} onNext={() => setStep(2)} />
      ) : (
        <ProfileStep
          form={form}
          setForm={setForm}
          onBack={() => setStep(1)}
          onCreate={onCreate}
          submitting={submitting}
        />
      )}

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

function ProgressBar({ step }: { step: 1 | 2 }) {
  const { t } = useTranslation();
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <span className="tw-eyebrow">{t('auth.stepOf', { current: step, total: 2 })}</span>
        <span className="tw-micro" style={{ color: 'var(--text-3)' }}>
          {step === 1 ? t('auth.stepAccount') : t('auth.stepProfile')}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <div style={{ flex: 1, height: 3, background: 'var(--accent)', borderRadius: 999 }} />
        <div
          style={{
            flex: 1,
            height: 3,
            background: step === 2 ? 'var(--accent)' : 'var(--surface-2)',
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}

function AccountStep({
  form,
  setForm,
  onNext,
}: {
  form: SignupForm;
  setForm: (updater: (prev: SignupForm) => SignupForm) => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  const patch = (key: keyof SignupForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onNext();
  };

  return (
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
          required
        />
        <Input
          label={t('auth.lastName')}
          placeholder={t('auth.lastNamePlaceholder')}
          autoComplete="family-name"
          value={form.lastName}
          onChange={(e) => patch('lastName', e.currentTarget.value)}
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
        required
      />
      <Button
        type="submit"
        variant="primary"
        size="md"
        trailingIcon="arrow-right"
        fullWidth
        style={{ marginTop: 8 }}
      >
        {t('common.continue')}
      </Button>
    </form>
  );
}

function ProfileStep({
  form,
  setForm,
  onBack,
  onCreate,
  submitting,
}: {
  form: SignupForm;
  setForm: (updater: (prev: SignupForm) => SignupForm) => void;
  onBack: () => void;
  onCreate: () => void;
  submitting: boolean;
}) {
  const { t } = useTranslation();
  const patch = <K extends keyof SignupForm>(key: K, value: SignupForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <AvatarUploader />
      <Input
        label={t('auth.organization')}
        placeholder={t('auth.organizationPlaceholder')}
        value={form.organization}
        onChange={(e) => patch('organization', e.currentTarget.value)}
        disabled={submitting}
      />
      <Select
        label={t('auth.yourRole')}
        value={form.role}
        onChange={(v) => patch('role', v as RoleOptionKey)}
        disabled={submitting}
        options={ROLE_OPTION_KEYS.map((r) => ({ value: r, label: t(`agents.roleOptions.${r}`) }))}
      />
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <Button variant="ghost" leadingIcon="chevron-left" onClick={onBack}>
          {t('common.back')}
        </Button>
        <Button
          variant="primary"
          size="md"
          style={{ flex: 1 }}
          onClick={onCreate}
          disabled={submitting}
        >
          {submitting ? t('auth.creatingAccount') : t('auth.createAccount')}
        </Button>
      </div>
    </div>
  );
}

function AvatarUploader() {
  const { t } = useTranslation();
  const toast = useToast();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        marginBottom: 4,
      }}
    >
      <div style={{ position: 'relative', width: 110, height: 110 }}>
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 999,
            background: 'var(--surface-2)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-3)',
          }}
        >
          <Icon name="user" size={40} strokeWidth={1.5} />
        </div>
        <button
          onClick={() => toast.show({ title: t('auth.photoUploadComingSoon') })}
          style={{
            position: 'absolute',
            right: -2,
            bottom: -2,
            width: 36,
            height: 36,
            borderRadius: 999,
            background: 'var(--accent)',
            color: 'var(--on-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid var(--paper)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
          }}
          aria-label={t('auth.addPhotoOptional')}
        >
          <Icon name="camera" size={14} />
        </button>
      </div>
      <div className="tw-micro" style={{ color: 'var(--text-3)' }}>
        {t('auth.addPhotoOptional')}
      </div>
    </div>
  );
}
