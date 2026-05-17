import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n, {
  LOCALE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  type SupportedLocale,
} from '../i18n';
import { useAuthStore } from '../lib/stores/authStore';
import { Icon } from './Icon';
import { Button } from './primitives';
import { DialogShell, Overlay } from './shells';

interface LanguagePickerDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LanguagePickerDialog({ open, onClose }: LanguagePickerDialogProps) {
  const { t } = useTranslation();
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const isAuthed = useAuthStore((s) => !!s.user);
  const [selected, setSelected] = useState<SupportedLocale>(
    (i18n.language as SupportedLocale) ?? 'en',
  );
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const onConfirm = async () => {
    setSaving(true);
    try {
      await i18n.changeLanguage(selected);
      localStorage.setItem(LOCALE_STORAGE_KEY, selected);
      if (isAuthed) {
        try {
          await updateProfile({ locale: selected });
        } catch {
          // local preference still applies even if server sync fails
        }
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <DialogShell title={t('language.pickerHeading')} icon="languages" tone="accent">
        <div className="tw-small" style={{ color: 'var(--text-2)', marginBottom: 18 }}>
          {t('language.pickerSubtitle')}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 10,
            marginBottom: 18,
          }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelected(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: isSelected ? 'var(--accent-soft)' : 'var(--surface)',
                  color: isSelected ? 'var(--accent)' : 'var(--text)',
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 160ms ease-out, border-color 160ms ease-out',
                }}
              >
                {isSelected && <Icon name="check" size={14} strokeWidth={2.2} />}
                {lang.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={() => void onConfirm()} disabled={saving}>
            {saving ? t('profile.saving') : t('common.save')}
          </Button>
        </div>
      </DialogShell>
    </Overlay>
  );
}
