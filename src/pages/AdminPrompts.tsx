import { useTranslation } from 'react-i18next';
import { AdminHeader, AgentPromptRow } from '../components/admin';
import { Alert } from '../components/primitives';
import { AppShell, MobileHeader } from '../components/shells';
import { AGENTS } from '../lib/agents';
import { useAgentPrompts } from '../lib/hooks/useAgentPrompts';
import { useIsMobile } from '../lib/hooks/useIsMobile';
import { useToast } from '../lib/hooks/useToast';

export default function AdminPrompts() {
  const { t } = useTranslation();
  const { drafts, loading, error, toggleExpanded, update, resetToDefault, cancel, save } =
    useAgentPrompts();
  const toast = useToast();
  const isMobile = useIsMobile();

  return (
    <AppShell>
      {isMobile ? (
        <MobileHeader title={t('adminPrompts.title')} />
      ) : (
        <AdminHeader
          eyebrow={t('adminPrompts.eyebrow')}
          title={t('adminPrompts.title')}
          subtitle={t('adminPrompts.subtitle')}
        />
      )}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: isMobile ? '20px 16px 32px' : '0 32px 32px',
          position: 'relative',
        }}
      >
        {error && (
          <div style={{ marginBottom: 16 }}>
            <Alert variant="destructive" title={t('adminPrompts.loadFailed')}>
              {error}
            </Alert>
          </div>
        )}
        {loading ? (
          <div className="tw-small" style={{ color: 'var(--text-3)', padding: '12px 4px' }}>
            {t('adminPrompts.loadingPrompts')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {AGENTS.map((a) => {
              const agentName = t(`agents.${a.id}.name`);
              return (
                <AgentPromptRow
                  key={a.id}
                  agent={a}
                  draft={drafts[a.id]}
                  onToggle={() => toggleExpanded(a.id)}
                  onChange={(p) => update(a.id, p)}
                  onReset={() => {
                    void resetToDefault(a);
                    toast.show({
                      variant: 'info',
                      title: t('adminPrompts.resetToDefaultToast', { name: agentName }),
                    });
                  }}
                  onCancel={() => void cancel(a)}
                  onSave={() => {
                    void save(a);
                    toast.show({
                      variant: 'success',
                      title: t('adminPrompts.promptSaved'),
                      body: t('adminPrompts.promptSavedBody', {
                        name: drafts[a.id].name,
                      }),
                    });
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
