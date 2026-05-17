import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../lib/hooks/useIsMobile';
import { AuthLanguageSwitcher } from '../AuthLanguageSwitcher';
import { IconButton, Wordmark } from '../primitives';
import { useTheme } from '../Theme';
import { ShemaWaveDecor } from './ShemaWaveDecor';

interface AuthShellProps {
  alert?: ReactNode;
  children: ReactNode;
}

export function AuthShell({ alert, children }: AuthShellProps) {
  const { t } = useTranslation();
  const { mode, toggle } = useTheme();
  const isMobile = useIsMobile();
  const isDesktop = !isMobile;
  const isDark = mode === 'dark';

  return (
    <div
      className={`tw-root tw-${mode}`}
      style={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(135deg, var(--bg) 0%, var(--surface) 55%, color-mix(in oklab, var(--accent) 12%, var(--bg)) 100%)'
          : 'linear-gradient(135deg, var(--surface) 0%, var(--bg) 55%, color-mix(in oklab, var(--accent) 7%, var(--surface)) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <ShemaWaveDecor
        corner="bottom-left"
        size={520}
        offset={140}
        opacity={isDark ? 0.07 : 0.09}
      />
      <ShemaWaveDecor
        corner="top-right"
        size={360}
        offset={80}
        opacity={isDark ? 0.05 : 0.07}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: isMobile ? '20px 16px 24px' : '28px 40px 32px',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: isMobile ? 24 : 0,
          }}
        >
          <Wordmark size={isMobile ? 20 : 22} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <IconButton
              icon="sparkles"
              variant="ghost"
              hoverFill={false}
              size={32}
              iconSize={14}
              aria-label={isDark ? t('common.switchToLight') : t('common.switchToDark')}
              onClick={toggle}
            />
            <AuthLanguageSwitcher />
          </div>
        </header>

        <main
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isDesktop ? 80 : 0,
            padding: isDesktop ? '40px 32px' : '0',
            maxWidth: 1240,
            margin: '0 auto',
            width: '100%',
          }}
        >
          {isDesktop && (
            <section
              style={{
                flex: '1 1 0',
                maxWidth: 520,
                display: 'flex',
                flexDirection: 'column',
                gap: 22,
              }}
            >
              <h1
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: 'clamp(56px, 6vw, 84px)',
                  lineHeight: 1.02,
                  fontWeight: 400,
                  letterSpacing: '-0.025em',
                  margin: 0,
                  color: 'var(--text)',
                  fontVariationSettings: '"opsz" 144, "SOFT" 50',
                }}
              >
                <span style={{ display: 'block' }}>{t('authHero.line1')}</span>
                <span
                  style={{
                    display: 'block',
                    background:
                      'linear-gradient(135deg, var(--accent) 0%, color-mix(in oklab, var(--accent) 55%, #89AAA3) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontStyle: 'italic',
                  }}
                >
                  {t('authHero.line2')}
                </span>
                <span style={{ display: 'block', color: 'var(--text-2)' }}>{t('authHero.line3')}</span>
              </h1>
              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.55,
                  color: 'var(--text-2)',
                  maxWidth: 400,
                  margin: 0,
                }}
              >
                {t('authHero.subtitle')}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                {(
                  [
                    'pillStoryteller',
                    'pillConversation',
                    'pillOral',
                    'pillHealth',
                  ] as const
                ).map((key, i) => (
                  <span
                    key={key}
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      padding: '6px 12px',
                      borderRadius: 999,
                      background:
                        i === 0
                          ? 'color-mix(in oklab, var(--accent) 14%, transparent)'
                          : 'color-mix(in oklab, var(--text) 6%, transparent)',
                      color: i === 0 ? 'var(--accent)' : 'var(--text-2)',
                      border:
                        i === 0
                          ? '1px solid color-mix(in oklab, var(--accent) 28%, transparent)'
                          : '1px solid color-mix(in oklab, var(--text) 10%, transparent)',
                    }}
                  >
                    {t(`authHero.${key}`)}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section
            style={{
              flex: isDesktop ? '0 0 440px' : '1 1 100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              maxWidth: isDesktop ? 440 : 480,
              margin: isDesktop ? '0' : '0 auto',
              width: '100%',
            }}
          >
            {isMobile && (
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <h1
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontSize: 'clamp(32px, 9vw, 44px)',
                    lineHeight: 1.05,
                    fontWeight: 400,
                    letterSpacing: '-0.02em',
                    margin: 0,
                    color: 'var(--text)',
                  }}
                >
                  {t('authHero.line1')}{' '}
                  <span
                    style={{
                      background:
                        'linear-gradient(135deg, var(--accent) 0%, color-mix(in oklab, var(--accent) 55%, #89AAA3) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontStyle: 'italic',
                    }}
                  >
                    {t('authHero.line2')}
                  </span>{' '}
                  <span style={{ color: 'var(--text-2)' }}>{t('authHero.line3')}</span>
                </h1>
              </div>
            )}

            {alert && <div style={{ width: '100%' }}>{alert}</div>}

            <div
              style={{
                background: isDark
                  ? 'color-mix(in oklab, var(--paper) 88%, transparent)'
                  : 'color-mix(in oklab, var(--paper) 96%, transparent)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: `1px solid color-mix(in oklab, var(--accent) ${isDark ? 14 : 18}%, transparent)`,
                borderRadius: 24,
                padding: isMobile ? 24 : 32,
                boxShadow: isDark
                  ? '0 30px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)'
                  : 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.6)',
              }}
            >
              {children}
            </div>
          </section>
        </main>

        <footer
          style={{
            marginTop: 24,
            display: 'flex',
            justifyContent: 'center',
            color: 'var(--text-4)',
            fontSize: 12,
            fontStyle: 'italic',
            fontFamily: 'Fraunces, serif',
          }}
        >
          {t('authHero.byline')}
        </footer>
      </div>
    </div>
  );
}
