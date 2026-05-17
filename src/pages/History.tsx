import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { AgentIconBadge } from '../components/chat';
import { Alert, Input, Spinner } from '../components/primitives';
import { AppShell, MobileHeader, TopBar } from '../components/shells';
import { AGENT_BY_ID } from '../lib/agents';
import type { ChatSummary } from '../lib/api/types';
import type { ChatHistoryItem } from '../lib/fixtures';
import { useChatHistory } from '../lib/hooks/useChatHistory';
import { useIsMobile } from '../lib/hooks/useIsMobile';
import { formatRelative, groupByBucket } from '../lib/time';

function toHistoryItem(c: ChatSummary, untitled: string): ChatHistoryItem {
  return {
    id: c.id,
    title: c.title || untitled,
    agentId: c.agent_id,
    preview: c.last_message_preview || '',
    lastMessageAt: new Date(c.last_message_at || c.updated_at || c.created_at),
  };
}

export default function History() {
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();
  const [query, setQuery] = useState('');
  const isMobile = useIsMobile();
  const { chats, loading, error } = useChatHistory();
  const untitled = t('history.untitledChat');

  const items = useMemo(
    () => chats.map((c) => toHistoryItem(c, untitled)),
    [chats, untitled],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) =>
      [c.title, c.preview, t(`agents.${c.agentId}.name`)].some((s) =>
        s.toLowerCase().includes(q),
      ),
    );
  }, [items, query, t]);

  const buckets = useMemo(() => groupByBucket(filtered), [filtered]);

  return (
    <AppShell>
      {isMobile ? <MobileHeader title={t('history.title')} /> : <TopBar />}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: isMobile ? '20px 16px 48px' : '32px 64px 64px',
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div className="tw-eyebrow" style={{ marginBottom: 12 }}>
            {t('history.eyebrow')}
          </div>
          <h1 className="tw-h1">{t('history.title')}</h1>
          <div
            className="tw-body"
            style={{ color: 'var(--text-2)', marginTop: 8, marginBottom: 28, fontSize: 16 }}
          >
            {t('history.subtitle')}
          </div>

          {error && (
            <div style={{ marginBottom: 20 }}>
              <Alert variant="destructive" title={t('history.loadFailed')}>
                {error}
              </Alert>
            </div>
          )}

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('history.searchPlaceholder')}
            leadingIcon="search"
          />

          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 28 }}>
            {loading ? (
              <div
                className="tw-small"
                style={{
                  color: 'var(--text-3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Spinner size="sm" tone="muted" />
                {t('history.loadingConversations')}
              </div>
            ) : buckets.length === 0 ? (
              <EmptyState query={query} />
            ) : (
              buckets.map((b) => (
                <section key={b.label}>
                  <div className="tw-eyebrow" style={{ marginBottom: 12, paddingLeft: 4 }}>
                    {t(`time.${b.label}`, { defaultValue: b.label })}
                  </div>
                  <div
                    style={{
                      background: 'var(--paper)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 18,
                      boxShadow: 'var(--shadow-xs)',
                      overflow: 'hidden',
                    }}
                  >
                    {b.items.map((item, i) => (
                      <HistoryRow
                        key={item.id}
                        item={item}
                        last={i === b.items.length - 1}
                        onOpen={() => navigate(`/chat/${item.id}`)}
                        locale={i18n.language}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

interface HistoryRowProps {
  item: ChatHistoryItem;
  last: boolean;
  onOpen: () => void;
  locale: string;
}

function HistoryRow({ item, last, onOpen, locale }: HistoryRowProps) {
  const { t } = useTranslation();
  const agent = AGENT_BY_ID[item.agentId];
  return (
    <button
      onClick={onOpen}
      className="tw-hover-surface"
      style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr auto',
        gap: 12,
        alignItems: 'center',
        padding: '14px 16px',
        borderBottom: last ? 'none' : '1px solid var(--border-faint)',
        background: 'transparent',
        border: 0,
        borderRadius: 0,
        width: '100%',
        textAlign: 'left',
        color: 'inherit',
        cursor: 'pointer',
      }}
    >
      <AgentIconBadge agent={agent} size={36} tone="neutral" iconSize={16} />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'var(--text-2)',
            marginTop: 3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <span style={{ color: 'var(--accent)', fontStyle: 'italic', fontFamily: 'Fraunces, serif' }}>
            {t(`agents.${agent.id}.name`)}
          </span>
          <span style={{ color: 'var(--text-4)', margin: '0 6px' }}>·</span>
          {item.preview}
        </div>
      </div>
      <div
        className="tw-micro"
        style={{ color: 'var(--text-3)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
      >
        {formatRelative(item.lastMessageAt, undefined, locale)}
      </div>
    </button>
  );
}

function EmptyState({ query }: { query: string }) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 18,
        boxShadow: 'var(--shadow-xs)',
        padding: '64px 24px',
        textAlign: 'center',
        color: 'var(--text-2)',
      }}
    >
      <div className="tw-h3-serif" style={{ fontSize: 20, color: 'var(--text)' }}>
        {query ? t('history.emptyWithSearch') : t('history.emptyNoSearch')}
      </div>
      <div className="tw-small" style={{ marginTop: 6 }}>
        {query ? t('history.emptyBodySearch') : t('history.emptyBodyStart')}
      </div>
    </div>
  );
}
