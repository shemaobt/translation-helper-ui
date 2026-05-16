import { api } from './client';
import type { AgentInfo } from './types';

export async function listAgents(): Promise<AgentInfo[]> {
  const { data } = await api.get<AgentInfo[]>('/api/translation-helper/agents');
  return data;
}
