import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../stores/authStore';

export interface UserSummary {
  displayName: string;
  email: string;
  isPlatformAdmin: boolean;
  appRoles: string[];
}

function toSummary(
  authUser: ReturnType<typeof useAuthStore.getState>['user'],
  appRoles: string[],
): UserSummary {
  if (!authUser) {
    return { displayName: '', email: '', isPlatformAdmin: false, appRoles: [] };
  }
  return {
    displayName: authUser.display_name ?? '',
    email: authUser.email,
    isPlatformAdmin: authUser.is_platform_admin,
    appRoles,
  };
}

export function useCurrentUser() {
  const authUser = useAuthStore((s) => s.user);
  const appRoles = useAuthStore((s) => s.appRoles);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const refreshMe = useAuthStore((s) => s.refreshMe);

  const user = useMemo(() => toSummary(authUser, appRoles), [authUser, appRoles]);
  const [draftDisplayName, setDraftDisplayName] = useState(user.displayName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftDisplayName(user.displayName);
  }, [user.displayName]);

  useEffect(() => {
    if (!authUser) void refreshMe();
  }, [authUser, refreshMe]);

  const dirty = draftDisplayName.trim() !== user.displayName.trim();

  const save = async (): Promise<void> => {
    if (!dirty) return;
    const trimmed = draftDisplayName.trim();
    if (!trimmed) {
      throw new Error('Display name cannot be empty');
    }
    setSaving(true);
    try {
      await updateProfile({ display_name: trimmed });
    } finally {
      setSaving(false);
    }
  };

  return {
    user,
    draftDisplayName,
    setDraftDisplayName,
    dirty,
    saving,
    save,
  };
}
