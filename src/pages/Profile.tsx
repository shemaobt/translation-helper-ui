import { useLocation } from 'wouter';
import { Icon } from '../components/Icon';
import { Avatar, Button, Input, Select } from '../components/primitives';
import { SettingsCard } from '../components/settings';
import { AppShell, MobileHeader, TopBar } from '../components/shells';
import { ROLE_OPTIONS } from '../lib/agents';
import { useCurrentUser } from '../lib/hooks/useCurrentUser';
import { useIsMobile } from '../lib/hooks/useIsMobile';
import { useToast } from '../lib/hooks/useToast';

export default function Profile() {
  const { user, draftOrg, setDraftOrg, draftRole, setDraftRole, dirty, save } = useCurrentUser();
  const toast = useToast();
  const isMobile = useIsMobile();
  const [, navigate] = useLocation();

  return (
    <AppShell>
      {isMobile ? <MobileHeader title="Settings" /> : <TopBar />}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: isMobile ? '20px 16px 48px' : '32px 64px 64px',
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="tw-eyebrow" style={{ marginBottom: 12 }}>
            Account
          </div>
          <h1 className="tw-h1">Settings</h1>
          <div
            className="tw-body"
            style={{ color: 'var(--text-2)', marginTop: 8, marginBottom: 36, fontSize: 16 }}
          >
            Manage your profile and account.
          </div>

          <SettingsCard
            title="Profile picture"
            subtitle="JPG, PNG up to 5 MB. Square crops work best."
          >
            <div
              style={{
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 16 : 24,
              }}
            >
              <Avatar size={isMobile ? 64 : 88} name={`${user.firstName} ${user.lastName}`} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button
                  variant="secondary"
                  leadingIcon="upload"
                  onClick={() => toast.show({ title: 'Photo upload — coming soon' })}
                >
                  Upload new
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => toast.show({ title: 'Photo removed' })}
                >
                  Remove
                </Button>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard title="Account information" subtitle="Synced from your account.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ReadOnlyRow label="First name" value={user.firstName} />
              <ReadOnlyRow label="Last name" value={user.lastName} />
              <ReadOnlyRow label="Email" value={user.email} />
            </div>
          </SettingsCard>

          <SettingsCard
            title="Organization"
            subtitle="How you describe your work."
            actionLabel="Save changes"
            actionDisabled={!dirty}
            onAction={() => {
              void save();
              toast.show({ variant: 'success', title: 'Organization updated' });
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input
                label="Organization"
                value={draftOrg}
                onChange={(e) => setDraftOrg(e.target.value)}
              />
              <Select
                label="Your role"
                value={draftRole}
                onChange={setDraftRole}
                options={ROLE_OPTIONS.map((r) => ({ value: r, label: r }))}
              />
            </div>
          </SettingsCard>

          <SettingsCard
            title="Change password"
            subtitle="We'll email you a secure reset link to set a new password."
            actionLabel="Email me a reset link"
            onAction={() => navigate('/forgot-password')}
          >
            <div className="tw-small" style={{ color: 'var(--text-2)' }}>
              For security, password changes go through the same flow as a forgotten password.
              You'll receive an email with a one-time link.
            </div>
          </SettingsCard>
        </div>
      </div>
    </AppShell>
  );
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 18px',
        background: 'var(--surface-2)',
        borderRadius: 14,
      }}
    >
      <div className="tw-eyebrow" style={{ width: 110 }}>
        {label}
      </div>
      <div style={{ flex: 1, fontSize: 14 }}>{value}</div>
      <button
        onClick={() => navigator.clipboard?.writeText(value)}
        style={{
          color: 'var(--text-3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          cursor: 'pointer',
          background: 'transparent',
          border: 0,
        }}
      >
        <Icon name="copy" size={13} /> Copy
      </button>
    </div>
  );
}
