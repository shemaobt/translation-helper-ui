import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Redirect } from 'wouter';
import { useAuthStore } from '../lib/stores/authStore';

interface Props {
  children: ReactNode;
  requirePlatformAdmin?: boolean;
}

export default function ProtectedRoute({ children, requirePlatformAdmin }: Props) {
  const { user, tokens, loaded, refreshMe } = useAuthStore();

  useEffect(() => {
    if (!loaded && tokens?.access) {
      void refreshMe();
    }
  }, [loaded, tokens?.access, refreshMe]);

  if (!loaded && tokens?.access) {
    return <div className="tw-loading" style={{ padding: 'var(--space-8)' }}>Loading…</div>;
  }

  if (!tokens?.access || !user) {
    return <Redirect to="/login" />;
  }

  if (requirePlatformAdmin && !user.is_platform_admin) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
