import { useLocation } from 'wouter';
import { Button } from '../components/primitives';
import { AppShell, MobileHeader, ShemaWaveDecor, TopBar } from '../components/shells';
import { useIsMobile } from '../lib/hooks/useIsMobile';

export default function NotFound() {
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  return (
    <AppShell>
      {isMobile ? <MobileHeader title="Not found" /> : <TopBar />}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? 24 : 48,
          position: 'relative',
        }}
      >
        <ShemaWaveDecor
          corner="top-right"
          size={isMobile ? 220 : 380}
          offset={isMobile ? 60 : 100}
          opacity={0.05}
        />
        <div style={{ textAlign: 'center', maxWidth: 480, position: 'relative', zIndex: 1 }}>
          <div
            style={{
              fontFamily: 'Fraunces, serif',
              fontSize: isMobile ? 88 : 140,
              fontWeight: 400,
              color: 'var(--text-3)',
              letterSpacing: '-0.04em',
              lineHeight: 1,
              fontVariationSettings: '"opsz" 144, "SOFT" 50',
            }}
          >
            404
          </div>
          <div className="tw-h1" style={{ marginTop: 18, fontSize: isMobile ? 24 : 36 }}>
            We couldn't find that page.
          </div>
          <div
            className="tw-body"
            style={{ color: 'var(--text-2)', marginTop: 10, fontSize: isMobile ? 14 : 16 }}
          >
            The link may be broken or the page may have moved.
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 26,
            }}
          >
            <Button variant="ghost" leadingIcon="chevron-left" onClick={() => history.back()}>
              Go back
            </Button>
            <Button variant="primary" leadingIcon="home" onClick={() => navigate('/')}>
              Go to home
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
