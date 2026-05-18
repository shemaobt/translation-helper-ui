import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'wouter';
import { useAuthStore } from '../lib/stores/authStore';
import { Spinner } from './primitives';
import { ThemeRoot } from './Theme';

interface Props {
  children: ReactNode;
  requirePlatformAdmin?: boolean;
}

export default function ProtectedRoute({ children, requirePlatformAdmin }: Props) {
  const { user, tokens, loaded, refreshMe } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loaded && tokens?.access) {
      void refreshMe();
    }
  }, [loaded, tokens?.access, refreshMe]);

  if (!loaded && tokens?.access) {
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
        <div className="tw-small" style={{ color: 'var(--text-3)', letterSpacing: '0.01em' }}>
          {t('common.loading')}
        </div>
      </ThemeRoot>
    );
  }

  if (!tokens?.access || !user) {
    return <Redirect to="/login" />;
  }

  if (requirePlatformAdmin && !user.is_platform_admin) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
