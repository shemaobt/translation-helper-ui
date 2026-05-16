import { api } from './client';
import type { AgentPrompt } from './types';

const BASE = '/api/translation-helper/prompts';

export async function listPrompts(): Promise<AgentPrompt[]> {
  const { data } = await api.get<AgentPrompt[]>(BASE);
  return data;
}

export async function getPrompt(agentId: string): Promise<AgentPrompt> {
  const { data } = await api.get<AgentPrompt>(`${BASE}/${agentId}`);
  return data;
}

export async function updatePrompt(
  agentId: string,
  payload: { name?: string; description?: string; prompt?: string },
): Promise<AgentPrompt> {
  const { data } = await api.put<AgentPrompt>(`${BASE}/${agentId}`, payload);
  return data;
}

export async function resetPrompt(agentId: string): Promise<AgentPrompt> {
  const { data } = await api.post<AgentPrompt>(`${BASE}/${agentId}/reset`);
  return data;
}
