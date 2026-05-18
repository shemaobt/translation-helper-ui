import { TH_APP_KEY } from '../constants';
import { api } from './client';
import type { CurrentUser } from './types';

interface AuthResponse {
  user: CurrentUser;
  tokens: { access_token: string; refresh_token: string; token_type: string };
}

export interface SignupRequest {
  email: string;
  password: string;
  display_name?: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/login', { email, password });
  return data;
}

export async function signup(payload: SignupRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/signup', payload);
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post('/api/auth/logout', { refresh_token: refreshToken });
}

export async function me(): Promise<CurrentUser> {
  const { data } = await api.get<CurrentUser>('/api/auth/me');
  return data;
}

export async function updateProfile(payload: {
  display_name?: string;
  avatar_url?: string | null;
  locale?: string | null;
}): Promise<CurrentUser> {
  const { data } = await api.patch<CurrentUser>('/api/auth/me', payload);
  return data;
}

export async function forgotPassword(email: string, appKey: string = TH_APP_KEY): Promise<void> {
  await api.post('/api/auth/forgot-password', { email, app_key: appKey });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await api.post('/api/auth/reset-password', { token, password });
}

export async function requestAccess(
  appKey: string = TH_APP_KEY,
  note?: string,
): Promise<void> {
  await api.post('/api/access-requests', { app_key: appKey, note });
}

export async function myRoles(appKey?: string): Promise<{ app_key: string; role_key: string }[]> {
  const { data } = await api.get<{ app_key: string; role_key: string }[]>(
    '/api/auth/my-roles',
    { params: appKey ? { app_key: appKey } : {} },
  );
  return data;
}
