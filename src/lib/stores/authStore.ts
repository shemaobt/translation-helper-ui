import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n, { LOCALE_STORAGE_KEY, isSupportedLocale } from '../../i18n';
import { authApi, configureApiAuth, type CurrentUser } from '../api';
import { useChatHistoryStore } from './chatHistoryStore';

function syncLocaleFromUser(user: CurrentUser | null): void {
  const locale = user?.locale;
  if (!locale || !isSupportedLocale(locale)) return;
  if (i18n.language === locale) return;
  void i18n.changeLanguage(locale);
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    void 0;
  }
}

interface Tokens {
  access: string;
  refresh: string;
}

interface AuthState {
  user: CurrentUser | null;
  tokens: Tokens | null;
  appRoles: string[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: {
    email: string;
    password: string;
    display_name?: string;
  }) => Promise<{ accessRequested: boolean }>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  refreshMyRoles: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (payload: {
    display_name?: string;
    locale?: string | null;
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      appRoles: [],
      loaded: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await authApi.login(email, password);
          set({
            user: res.user,
            tokens: { access: res.tokens.access_token, refresh: res.tokens.refresh_token },
            loaded: true,
            loading: false,
          });
          syncLocaleFromUser(res.user);
          await get().refreshMyRoles();
        } catch (e) {
          set({ loading: false, error: e instanceof Error ? e.message : 'Login failed' });
          throw e;
        }
      },

      signup: async (payload) => {
        set({ loading: true, error: null });
        try {
          const res = await authApi.signup(payload);
          set({
            user: res.user,
            tokens: { access: res.tokens.access_token, refresh: res.tokens.refresh_token },
            loaded: true,
            loading: false,
          });
          let accessRequested = true;
          try {
            await authApi.requestAccess('translation-helper');
          } catch (err) {
            accessRequested = false;
            console.warn('translation-helper access request failed:', err);
          }
          return { accessRequested };
        } catch (e) {
          set({ loading: false, error: e instanceof Error ? e.message : 'Signup failed' });
          throw e;
        }
      },

      logout: async () => {
        const refresh = get().tokens?.refresh;
        try {
          if (refresh) await authApi.logout(refresh);
        } catch {
          // ignore network errors on logout
        }
        set({ user: null, tokens: null, appRoles: [], loaded: true, error: null });
        useChatHistoryStore.getState().clear();
      },

      refreshMe: async () => {
        try {
          const user = await authApi.me();
          set({ user, loaded: true });
          syncLocaleFromUser(user);
        } catch {
          set({ user: null, tokens: null, appRoles: [], loaded: true });
        }
      },

      refreshMyRoles: async () => {
        try {
          const roles = await authApi.myRoles('translation-helper');
          set({ appRoles: roles.map((r) => r.role_key) });
        } catch {
          set({ appRoles: [] });
        }
      },

      forgotPassword: async (email) => {
        await authApi.forgotPassword(email);
      },

      resetPassword: async (token, password) => {
        await authApi.resetPassword(token, password);
      },

      updateProfile: async (payload) => {
        const user = await authApi.updateProfile(payload);
        set({ user });
        syncLocaleFromUser(user);
      },
    }),
    {
      name: 'th-auth',
      partialize: (s) => ({ tokens: s.tokens, user: s.user, appRoles: s.appRoles }),
    },
  ),
);

configureApiAuth({
  getAccessToken: () => useAuthStore.getState().tokens?.access ?? null,
  onUnauthorized: () => {
    useAuthStore.setState({ user: null, tokens: null, appRoles: [], loaded: true });
  },
});

export async function bootstrapAuth(): Promise<void> {
  const { tokens, refreshMe, refreshMyRoles } = useAuthStore.getState();
  if (tokens?.access) {
    await refreshMe();
    if (useAuthStore.getState().user) {
      await refreshMyRoles();
    }
  } else {
    useAuthStore.setState({ loaded: true });
  }
}
