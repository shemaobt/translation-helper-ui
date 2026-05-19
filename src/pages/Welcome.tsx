import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { InspirationCard, MainInput } from '../components/chat';
import { Icon } from '../components/Icon';
import { AppShell, MobileHeader, TopBar } from '../components/shells';
import { AGENTS, AGENT_BY_ID, type AgentId } from '../lib/agents';
import { useIsMobile } from '../lib/hooks/useIsMobile';
import { useToast } from '../lib/hooks/useToast';

export default function Welcome() {
  const [, navigate] = useLocation();
  const [draft, setDraft] = useState('');
  const [agentId, setAgentId] = useState<AgentId>('storyteller');
  const isMobile = useIsMobile();

  const startThread = () => navigate(`/chat/new-${Date.now()}`);

  return (
    <AppShell presentational>
      {isMobile ? <MobileHeader showBrand /> : <TopBar />}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: isMobile ? '0 16px 32px' : '0 64px 48px',
        }}
      >
        <div
          style={{
            maxWidth: 880,
            margin: '0 auto',
            paddingTop: isMobile ? 20 : 36,
          }}
        >
          <Hero isMobile={isMobile} />
          <div style={{ marginTop: isMobile ? 20 : 32 }}>
            <MainInput
              value={draft}
              onChange={setDraft}
              onSend={startThread}
              state="idle"
              agent={AGENT_BY_ID[agentId]}
              onAgentSelect={setAgentId}
              showHint={!isMobile}
            />
          </div>
          <InspirationSection
            isMobile={isMobile}
            onSelect={(id) => {
              setAgentId(id);
              startThread();
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}

function Hero({ isMobile }: { isMobile: boolean }) {
  const { t } = useTranslation();
  return (
    <div style={{ paddingRight: isMobile ? 0 : 100 }}>
      <h1
        className="tw-display"
        style={{
          lineHeight: 1.04,
          fontSize: isMobile ? 'clamp(32px, 9vw, 44px)' : undefined,
        }}
      >
        {t('welcome.heroHello')}{' '}
        <span className="tw-brand-wordmark" style={{ fontSize: 'inherit', fontStyle: 'italic' }}>
          {t('welcome.heroBrand')}
        </span>
        <br />
        <span style={{ color: 'var(--text-2)', fontStyle: 'italic' }}>
          {t('welcome.heroPrompt')}
        </span>
      </h1>
      <div
        style={{
          marginTop: 16,
          fontSize: isMobile ? 15 : 17,
          lineHeight: 1.5,
          color: 'var(--text-2)',
          maxWidth: 540,
        }}
      >
        {t('welcome.heroSubtitle')}
      </div>
    </div>
  );
}

interface InspirationSectionProps {
  onSelect: (id: AgentId) => void;
  isMobile: boolean;
}

function InspirationSection({ onSelect, isMobile }: InspirationSectionProps) {
  const { t } = useTranslation();
  const toast = useToast();
  return (
    <div style={{ marginTop: isMobile ? 32 : 48 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: isMobile ? 14 : 18,
        }}
      >
        <h2 className="tw-h3-serif" style={{ fontSize: isMobile ? 20 : 22 }}>
          {t('welcome.inspirationTitle')}
        </h2>
        <button
          onClick={() => toast.show({ title: t('welcome.discoverComingSoon') })}
          className="tw-small"
          style={{
            color: 'var(--text-2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            background: 'transparent',
            border: 0,
            padding: 0,
          }}
        >
          {t('welcome.viewAll')} <Icon name="arrow-right" size={12} />
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? 12 : 16,
        }}
      >
        {AGENTS.map((a) => (
          <InspirationCard key={a.id} agent={a} onSelect={() => onSelect(a.id)} />
        ))}
      </div>
    </div>
  );
}
