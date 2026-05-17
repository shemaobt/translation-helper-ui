import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Icon } from '../components/Icon';
import { Avatar, Button, Input, Pill } from '../components/primitives';
import { SettingsCard } from '../components/settings';
import { AppShell, MobileHeader, TopBar } from '../components/shells';
import { useCurrentUser } from '../lib/hooks/useCurrentUser';
import { useIsMobile } from '../lib/hooks/useIsMobile';
import { useToast } from '../lib/hooks/useToast';

export default function Profile() {
  const { t } = useTranslation();
  const { user, draftDisplayName, setDraftDisplayName, dirty, saving, save } =
    useCurrentUser();
  const toast = useToast();
  const isMobile = useIsMobile();
  const [, navigate] = useLocation();

  const onSaveDisplayName = async () => {
    try {
      await save();
      toast.show({ variant: 'success', title: t('profile.displayNameUpdated') });
    } catch (e) {
      toast.show({
        variant: 'error',
        title: t('profile.couldNotUpdateDisplayName'),
        body: e instanceof Error ? e.message : undefined,
      });
    }
  };

  return (
    <AppShell>
      {isMobile ? <MobileHeader title={t('profile.title')} /> : <TopBar />}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: isMobile ? '20px 16px 48px' : '32px 64px 64px',
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="tw-eyebrow" style={{ marginBottom: 12 }}>
            {t('profile.eyebrow')}
          </div>
          <h1 className="tw-h1">{t('profile.title')}</h1>
          <div
            className="tw-body"
            style={{ color: 'var(--text-2)', marginTop: 8, marginBottom: 36, fontSize: 16 }}
          >
            {t('profile.manageBlurb')}
          </div>

          <SettingsCard
            title={t('profile.profilePicture')}
            subtitle={t('profile.profilePictureSubtitle')}
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
                  onClick={() => toast.show({ title: t('auth.photoUploadComingSoon') })}
                >
                  {t('profile.uploadNew')}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => toast.show({ title: t('profile.photoRemoved') })}
                >
                  {t('profile.remove')}
                </Button>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard
            title={t('profile.accountInformation')}
            subtitle={t('profile.accountInformationSubtitle')}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ReadOnlyRow label={t('profile.emailLabel')} value={user.email} copyable />
            </div>
          </SettingsCard>

          <SettingsCard
            title={t('profile.displayName')}
            subtitle={t('profile.displayNameCardSubtitle')}
            actionLabel={saving ? t('profile.saving') : t('profile.saveChanges')}
            actionDisabled={!dirty || saving}
            onAction={() => void onSaveDisplayName()}
          >
            <Input
              label={t('profile.displayName')}
              value={draftDisplayName}
              onChange={(e) => setDraftDisplayName(e.target.value)}
              placeholder={t('profile.displayNamePlaceholder')}
              autoComplete="name"
            />
          </SettingsCard>

          <SettingsCard
            title={t('profile.yourAccess')}
            subtitle={t('profile.yourAccessSubtitle')}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {user.isPlatformAdmin && (
                <Pill variant="accent" leadingIcon="sparkles">
                  {t('profile.platformAdmin')}
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
                  {t('profile.noRolesYet')}
                </div>
              ) : null}
            </div>
          </SettingsCard>

          <SettingsCard
            title={t('profile.changePassword')}
            subtitle={t('profile.changePasswordSubtitle')}
            actionLabel={t('profile.changePasswordAction')}
            onAction={() => navigate('/forgot-password')}
          >
            <div className="tw-small" style={{ color: 'var(--text-2)' }}>
              {t('profile.changePasswordExplain')}
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
  const { t } = useTranslation();
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
          <Icon name="copy" size={13} /> {t('chat.copy')}
        </button>
      )}
    </div>
  );
}
