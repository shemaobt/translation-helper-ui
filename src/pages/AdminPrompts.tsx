import { AdminHeader, AgentPromptRow } from '../components/admin';
import { Alert } from '../components/primitives';
import { AppShell, MobileHeader } from '../components/shells';
import { AGENTS } from '../lib/agents';
import { useAgentPrompts } from '../lib/hooks/useAgentPrompts';
import { useIsMobile } from '../lib/hooks/useIsMobile';
import { useToast } from '../lib/hooks/useToast';

export default function AdminPrompts() {
  const { drafts, loading, error, toggleExpanded, update, resetToDefault, cancel, save } =
    useAgentPrompts();
  const toast = useToast();
  const isMobile = useIsMobile();

  return (
    <AppShell>
      {isMobile ? (
        <MobileHeader title="Agent prompts" />
      ) : (
        <AdminHeader
          eyebrow="Admin · Agent prompts"
          title="Agent prompts"
          subtitle="Edit the system instructions for each AI assistant."
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
            <Alert variant="destructive" title="Could not load prompts">
              {error}
            </Alert>
          </div>
        )}
        {loading ? (
          <div className="tw-small" style={{ color: 'var(--text-3)', padding: '12px 4px' }}>
            Loading prompts…
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {AGENTS.map((a) => (
              <AgentPromptRow
                key={a.id}
                agent={a}
                draft={drafts[a.id]}
                onToggle={() => toggleExpanded(a.id)}
                onChange={(p) => update(a.id, p)}
                onReset={() => {
                  void resetToDefault(a);
                  toast.show({ variant: 'info', title: `${a.name} reset to default` });
                }}
                onCancel={() => void cancel(a)}
                onSave={() => {
                  void save(a);
                  toast.show({
                    variant: 'success',
                    title: 'Prompt saved',
                    body: `${drafts[a.id].name} will use the new instructions on next chat.`,
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
