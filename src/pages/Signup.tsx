import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { Icon } from '../components/Icon';
import { Alert, Button, Input, Select } from '../components/primitives';
import { AuthShell } from '../components/shells';
import { ROLE_OPTIONS } from '../lib/agents';
import { useToast } from '../lib/hooks/useToast';
import { useAuthStore } from '../lib/stores/authStore';

interface SignupForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organization: string;
  role: string;
}

const initialForm = (): SignupForm => ({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  organization: '',
  role: ROLE_OPTIONS[0],
});

export default function Signup() {
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
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
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
          title: 'Account created',
          body: 'An admin will review your access shortly.',
        });
        navigate('/login?status=pending');
      } else {
        toast.show({
          variant: 'warning',
          title: 'Account created',
          body: "We couldn't queue your access request. Sign in and try again from Settings.",
        });
        navigate('/login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account');
    } finally {
      setSubmitting(false);
    }
  };

  const alert = error ? (
    <Alert variant="destructive" title="Signup failed">
      {error}
    </Alert>
  ) : undefined;

  return (
    <AuthShell alert={alert}>
      <ProgressBar step={step} />

      <div className="tw-h2" style={{ marginBottom: 6 }}>
        {step === 1 ? 'Create your account.' : 'Tell us about your work.'}
      </div>
      <div className="tw-small" style={{ color: 'var(--text-2)', marginBottom: 24 }}>
        {step === 1 ? 'A few details to get you set up.' : 'Helps us tailor the experience.'}
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
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

function ProgressBar({ step }: { step: 1 | 2 }) {
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
        <span className="tw-eyebrow">Step {step} of 2</span>
        <span className="tw-micro" style={{ color: 'var(--text-3)' }}>
          {step === 1 ? 'Account' : 'Profile'}
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
          label="First name"
          placeholder="Ana"
          autoComplete="given-name"
          value={form.firstName}
          onChange={(e) => patch('firstName', e.currentTarget.value)}
          required
        />
        <Input
          label="Last name"
          placeholder="Costa"
          autoComplete="family-name"
          value={form.lastName}
          onChange={(e) => patch('lastName', e.currentTarget.value)}
          required
        />
      </div>
      <Input
        label="Email"
        type="email"
        placeholder="you@translation.org"
        leadingIcon="mail"
        autoComplete="email"
        value={form.email}
        onChange={(e) => patch('email', e.currentTarget.value)}
        required
      />
      <Input
        label="Password"
        type="password"
        placeholder="At least 8 characters"
        leadingIcon="lock"
        hint="At least 8 characters."
        autoComplete="new-password"
        value={form.password}
        onChange={(e) => patch('password', e.currentTarget.value)}
        required
      />
      <Input
        label="Confirm password"
        type="password"
        placeholder="Re-enter password"
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
        Continue
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
  const patch = (key: keyof SignupForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <AvatarUploader />
      <Input
        label="Organization"
        placeholder="YWAM Brasil — Belo Horizonte"
        value={form.organization}
        onChange={(e) => patch('organization', e.currentTarget.value)}
      />
      <Select
        label="Your role"
        value={form.role}
        onChange={(v) => patch('role', v)}
        options={ROLE_OPTIONS.map((r) => ({ value: r, label: r }))}
      />
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <Button variant="ghost" leadingIcon="chevron-left" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          size="md"
          style={{ flex: 1 }}
          onClick={onCreate}
          disabled={submitting}
        >
          {submitting ? 'Creating…' : 'Create account'}
        </Button>
      </div>
    </div>
  );
}

function AvatarUploader() {
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
          onClick={() => toast.show({ title: 'Photo upload — coming soon' })}
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
          aria-label="Upload photo"
        >
          <Icon name="camera" size={14} />
        </button>
      </div>
      <div className="tw-micro" style={{ color: 'var(--text-3)' }}>
        Add a photo (optional)
      </div>
    </div>
  );
}
