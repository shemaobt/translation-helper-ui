import { useLocation } from 'wouter';
import { Icon } from '../components/Icon';
import { Avatar, Button, Input, Pill } from '../components/primitives';
import { SettingsCard } from '../components/settings';
import { AppShell, MobileHeader, TopBar } from '../components/shells';
import { useCurrentUser } from '../lib/hooks/useCurrentUser';
import { useIsMobile } from '../lib/hooks/useIsMobile';
import { useToast } from '../lib/hooks/useToast';

export default function Profile() {
  const { user, draftDisplayName, setDraftDisplayName, dirty, saving, save } =
    useCurrentUser();
  const toast = useToast();
  const isMobile = useIsMobile();
  const [, navigate] = useLocation();

  const onSaveDisplayName = async () => {
    try {
      await save();
      toast.show({ variant: 'success', title: 'Display name updated' });
    } catch (e) {
      toast.show({
        variant: 'error',
        title: 'Could not update display name',
        body: e instanceof Error ? e.message : undefined,
      });
    }
  };

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
              <Avatar size={isMobile ? 64 : 88} name={user.displayName || user.email} />
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
              <ReadOnlyRow label="Email" value={user.email} copyable />
            </div>
          </SettingsCard>

          <SettingsCard
            title="Display name"
            subtitle="How you appear to others across Translation Helper."
            actionLabel={saving ? 'Saving…' : 'Save changes'}
            actionDisabled={!dirty || saving}
            onAction={() => void onSaveDisplayName()}
          >
            <Input
              label="Display name"
              value={draftDisplayName}
              onChange={(e) => setDraftDisplayName(e.target.value)}
              placeholder="Ana Costa"
              autoComplete="name"
            />
          </SettingsCard>

          <SettingsCard
            title="Your access"
            subtitle="Roles are managed by your platform admin."
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {user.isPlatformAdmin && (
                <Pill variant="accent" leadingIcon="sparkles">
                  Platform admin
                </Pill>
              )}
              {user.appRoles.length > 0 ? (
                user.appRoles.map((role) => (
                  <Pill key={role} variant="approved" dot>
                    {role}
                  </Pill>
                ))
              ) : !user.isPlatformAdmin ? (
                <div className="tw-small" style={{ color: 'var(--text-2)' }}>
                  No translation-helper roles yet. An admin needs to approve your access
                  request.
                </div>
              ) : null}
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

interface ReadOnlyRowProps {
  label: string;
  value: string;
  copyable?: boolean;
}

function ReadOnlyRow({ label, value, copyable }: ReadOnlyRowProps) {
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
      <div style={{ flex: 1, fontSize: 14 }}>{value || '—'}</div>
      {copyable && value && (
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
      )}
    </div>
  );
}
