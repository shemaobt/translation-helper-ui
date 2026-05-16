import { useEffect, useState } from 'react';
import { agentsApi } from '../api';
import type { AgentInfo } from '../api/types';

interface State {
  agents: AgentInfo[];
  loading: boolean;
  error: string | null;
}

export function useAgents(): State {
  const [state, setState] = useState<State>({ agents: [], loading: true, error: null });

  useEffect(() => {
    void (async () => {
      try {
        const agents = await agentsApi.listAgents();
        setState({ agents, loading: false, error: null });
      } catch (e) {
        setState({
          agents: [],
          loading: false,
          error: e instanceof Error ? e.message : 'Failed to load agents',
        });
      }
    })();
  }, []);

  return state;
}
