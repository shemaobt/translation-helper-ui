import { useEffect, useMemo, useState } from 'react';
import type { CurrentUserProfile } from '../fixtures';
import { useAuthStore } from '../stores/authStore';

function splitDisplayName(displayName: string | null): { firstName: string; lastName: string } {
  if (!displayName) return { firstName: '', lastName: '' };
  const parts = displayName.trim().split(/\s+/);
  const [first, ...rest] = parts;
  return { firstName: first ?? '', lastName: rest.join(' ') };
}

function toProfile(user: ReturnType<typeof useAuthStore.getState>['user']): CurrentUserProfile {
  if (!user) {
    return { firstName: '', lastName: '', email: '', organization: '', role: '' };
  }
  const { firstName, lastName } = splitDisplayName(user.display_name);
  return {
    firstName,
    lastName,
    email: user.email,
    organization: '',
    role: '',
  };
}

export function useCurrentUser() {
  const authUser = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const refreshMe = useAuthStore((s) => s.refreshMe);

  const user = useMemo(() => toProfile(authUser), [authUser]);
  const [draftOrg, setDraftOrg] = useState(user.organization);
  const [draftRole, setDraftRole] = useState(user.role);

  useEffect(() => {
    setDraftOrg(user.organization);
    setDraftRole(user.role);
  }, [user.organization, user.role]);

  useEffect(() => {
    if (!authUser) void refreshMe();
  }, [authUser, refreshMe]);

  const dirty = useMemo(
    () => draftOrg !== user.organization || draftRole !== user.role,
    [draftOrg, draftRole, user.organization, user.role],
  );

  const save = async () => {
    if (!dirty) return;
    const display = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    await updateProfile({ display_name: display || undefined });
  };

  return { user, draftOrg, setDraftOrg, draftRole, setDraftRole, dirty, save };
}
