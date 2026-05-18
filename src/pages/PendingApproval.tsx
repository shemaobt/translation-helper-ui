import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Alert, Button, Spinner } from '../components/primitives';
import { AuthShell } from '../components/shells';
import { ThemeRoot } from '../components/Theme';
import { authApi } from '../lib/api';
import { TH_APP_KEY } from '../lib/constants';
import { useAuthStore } from '../lib/stores/authStore';

export default function PendingApproval() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { user, tokens, loaded, appRoles, refreshMyRoles, logout } = useAuthStore();
  const ensuredRequest = useRef(false);

  useEffect(() => {
    if (loaded && tokens?.access) {
      void refreshMyRoles();
    }
  }, [loaded, tokens?.access, refreshMyRoles]);

  // Belt + suspenders for cross-app users (e.g. signed up via meaning-map)
  // who land here via the role gate without ever having queued a request.
  // The backend create_access_request is idempotent so this is safe to call
  // on every mount.
  useEffect(() => {
    if (!loaded || !tokens?.access || !user || ensuredRequest.current) return;
    if (user.is_platform_admin || appRoles.length > 0) return;
    ensuredRequest.current = true;
    (async () => {
      try {
        await authApi.requestAccess(TH_APP_KEY);
        await refreshMyRoles();
      } catch (err) {
        console.warn(`${TH_APP_KEY} access request ensure failed:`, err);
      }
    })();
  }, [loaded, tokens?.access, user, appRoles.length, refreshMyRoles]);

  useEffect(() => {
    if (loaded && (!tokens?.access || !user)) {
      navigate('/login', { replace: true });
    }
  }, [loaded, tokens?.access, user, navigate]);

  useEffect(() => {
    if (user?.is_platform_admin || appRoles.length > 0) {
      navigate('/', { replace: true });
    }
  }, [user, appRoles, navigate]);

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (!loaded) {
    return (
      <ThemeRoot
        presentational
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
        }}
      >
        <Spinner size="lg" tone="accent" label={t('common.loading')} />
      </ThemeRoot>
    );
  }

  return (
    <AuthShell
      alert={
        <Alert variant="warning" title={t('pendingApproval.alertTitle')}>
          {t('pendingApproval.alertBody')}
        </Alert>
      }
    >
      <div className="tw-h2" style={{ marginBottom: 6 }}>
        {t('pendingApproval.heading')}
      </div>
      <div className="tw-small" style={{ color: 'var(--text-2)', marginBottom: 20 }}>
        {t('pendingApproval.subheading')}
      </div>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: 'var(--text-2)',
          margin: '0 0 24px',
        }}
      >
        {t('pendingApproval.body', { email: user?.email })}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button
          type="button"
          variant="secondary"
          size="md"
          fullWidth
          onClick={() => {
            void refreshMyRoles();
          }}
        >
          {t('pendingApproval.checkAgain')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="md"
          fullWidth
          onClick={() => {
            void handleSignOut();
          }}
        >
          {t('common.logout')}
        </Button>
      </div>
    </AuthShell>
  );
}
