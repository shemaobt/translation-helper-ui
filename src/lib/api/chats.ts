import type { AgentId } from '../agents';
import { api, apiBaseUrl } from './client';
import type { ChatDetail, ChatMessageDto, ChatSummary } from './types';

const BASE = '/api/translation-helper/chats';

export async function listChats(): Promise<ChatSummary[]> {
  const { data } = await api.get<ChatSummary[]>(BASE);
  return data;
}

export async function createChat(
  agentId: AgentId,
  title?: string,
): Promise<ChatSummary> {
  const { data } = await api.post<ChatSummary>(BASE, { agent_id: agentId, title });
  return data;
}

export async function getChat(chatId: string): Promise<ChatDetail> {
  const { data } = await api.get<ChatDetail>(`${BASE}/${chatId}`);
  return data;
}

export async function updateChat(
  chatId: string,
  payload: { title?: string; agent_id?: AgentId },
): Promise<ChatSummary> {
  const { data } = await api.patch<ChatSummary>(`${BASE}/${chatId}`, payload);
  return data;
}

export async function deleteChat(chatId: string): Promise<void> {
  await api.delete(`${BASE}/${chatId}`);
}

export async function listChatMessages(chatId: string): Promise<ChatMessageDto[]> {
  const { data } = await api.get<ChatMessageDto[]>(`${BASE}/${chatId}/messages`);
  return data;
}

export async function sendChatMessage(
  chatId: string,
  content: string,
  agentId?: AgentId,
): Promise<ChatMessageDto> {
  const { data } = await api.post<ChatMessageDto>(`${BASE}/${chatId}/messages`, {
    content,
    agent_id: agentId,
  });
  return data;
}

/** Streams assistant chunks via SSE; resolves when the stream ends. */
export async function streamChatMessage(
  chatId: string,
  content: string,
  agentId: AgentId | undefined,
  token: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const url = `${apiBaseUrl()}${BASE}/${chatId}/messages/stream`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ content, agent_id: agentId }),
    signal,
  });
  if (!response.ok || !response.body) {
    const text = await response.text();
    throw new Error(`Stream failed: ${response.status} ${text}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';
    for (const evt of events) {
      const lines = evt.split('\n').map((l) => l.trim());
      let eventName = 'message';
      let dataLine = '';
      for (const line of lines) {
        if (line.startsWith('event:')) eventName = line.slice(6).trim();
        else if (line.startsWith('data:')) dataLine = line.slice(5).trim();
      }
      if (!dataLine) continue;
      if (eventName === 'chunk') {
        try {
          const parsed = JSON.parse(dataLine) as { text?: string };
          if (parsed.text) onChunk(parsed.text);
        } catch {
          // ignore malformed
        }
      } else if (eventName === 'error') {
        let message = 'Streaming error';
        try {
          const parsed = JSON.parse(dataLine) as { message?: string };
          if (parsed.message) message = parsed.message;
        } catch {
          // Malformed error payload — fall back to default message.
        }
        throw new Error(message);
      } else if (eventName === 'done') {
        return;
      }
    }
  }
}
