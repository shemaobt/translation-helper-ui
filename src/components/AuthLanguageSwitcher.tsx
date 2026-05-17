import { useTranslation } from 'react-i18next';
import i18n, { LOCALE_STORAGE_KEY, SUPPORTED_LANGUAGES } from '../i18n';
import { useAuthStore } from '../lib/stores/authStore';
import { Icon } from './Icon';

export function AuthLanguageSwitcher() {
  const { i18n: i18nInstance } = useTranslation();
  const isAuthed = useAuthStore((s) => !!s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const current =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18nInstance.language) ?? SUPPORTED_LANGUAGES[0];

  const onChange = async (code: string) => {
    await i18n.changeLanguage(code);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, code);
    } catch {
      void 0;
    }
    if (isAuthed) {
      try {
        await updateProfile({ locale: code });
      } catch {
        void 0;
      }
    }
  };

  return (
    <label
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: 'var(--text-3)',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        padding: '6px 10px',
        borderRadius: 999,
        transition: 'background 160ms ease-out, color 160ms ease-out',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--text)';
        e.currentTarget.style.background = 'color-mix(in oklab, var(--text) 6%, transparent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-3)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <Icon name="globe" size={14} strokeWidth={1.6} />
      <span>{current.label}</span>
      <select
        value={current.code}
        onChange={(e) => void onChange(e.target.value)}
        aria-label="Language"
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'auto',
          inset: 0,
          width: '100%',
          height: '100%',
          cursor: 'pointer',
        }}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}
