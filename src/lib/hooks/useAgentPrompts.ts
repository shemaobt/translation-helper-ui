import { useCallback, useEffect, useState } from 'react';
import { AGENTS, type Agent, type AgentId } from '../agents';
import { promptsApi } from '../api';
import type { AgentPrompt } from '../api/types';

export interface PromptDraft {
  expanded: boolean;
  unsaved: boolean;
  saving: boolean;
  loaded: boolean;
  name: string;
  short: string;
  description: string;
  prompt: string;
  version: number;
}

type DraftMap = Record<AgentId, PromptDraft>;

const blank = (a: Agent): PromptDraft => ({
  expanded: false,
  unsaved: false,
  saving: false,
  loaded: false,
  name: a.name,
  short: a.short,
  description: '',
  prompt: '',
  version: 0,
});

const initial = (): DraftMap =>
  Object.fromEntries(AGENTS.map((a) => [a.id, blank(a)])) as DraftMap;

function fromApi(row: AgentPrompt): Partial<PromptDraft> {
  return {
    name: row.name,
    description: row.description,
    prompt: row.prompt,
    version: row.version,
    loaded: true,
    unsaved: false,
  };
}

export function useAgentPrompts() {
  const [drafts, setDrafts] = useState<DraftMap>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const patch = useCallback(
    (id: AgentId, p: Partial<PromptDraft>) =>
      setDrafts((d) => ({ ...d, [id]: { ...d[id], ...p } })),
    [],
  );

  useEffect(() => {
    void (async () => {
      try {
        const rows = await promptsApi.listPrompts();
        setDrafts((cur) => {
          const next = { ...cur };
          for (const row of rows) {
            const id = row.agent_id as AgentId;
            if (next[id]) {
              next[id] = { ...next[id], ...fromApi(row) };
            }
          }
          return next;
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load prompts');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleExpanded = useCallback(
    (id: AgentId) => setDrafts((d) => ({ ...d, [id]: { ...d[id], expanded: !d[id].expanded } })),
    [],
  );

  const update = useCallback(
    (id: AgentId, p: Partial<PromptDraft>) => patch(id, { ...p, unsaved: true }),
    [patch],
  );

  const resetToDefault = useCallback(
    async (a: Agent) => {
      patch(a.id, { saving: true });
      try {
        const row = await promptsApi.resetPrompt(a.id);
        patch(a.id, { ...fromApi(row), saving: false });
      } catch (e) {
        patch(a.id, { saving: false });
        setError(e instanceof Error ? e.message : 'Reset failed');
      }
    },
    [patch],
  );

  const cancel = useCallback(
    async (a: Agent) => {
      patch(a.id, { saving: true });
      try {
        const row = await promptsApi.getPrompt(a.id);
        patch(a.id, { ...fromApi(row), saving: false });
      } catch (e) {
        patch(a.id, { saving: false });
        setError(e instanceof Error ? e.message : 'Cancel failed');
      }
    },
    [patch],
  );

  const save = useCallback(
    async (a: Agent) => {
      const current = drafts[a.id];
      patch(a.id, { saving: true });
      try {
        const row = await promptsApi.updatePrompt(a.id, {
          name: current.name,
          description: current.description,
          prompt: current.prompt,
        });
        patch(a.id, { ...fromApi(row), saving: false });
      } catch (e) {
        patch(a.id, { saving: false });
        setError(e instanceof Error ? e.message : 'Save failed');
      }
    },
    [drafts, patch],
  );

  return {
    drafts,
    loading,
    error,
    toggleExpanded,
    update,
    resetToDefault,
    cancel,
    save,
  };
}
