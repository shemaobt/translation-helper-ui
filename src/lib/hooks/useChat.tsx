import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { AGENT_BY_ID, type Agent, type AgentId } from '../agents';
import { chatsApi } from '../api';
import type { ChatMessageDto } from '../api/types';
import type { ChatMessageSeed } from '../fixtures';
import { useAuthStore } from '../stores/authStore';

export type InputState = 'idle' | 'typing' | 'listening' | 'error';

const isNewThread = (id?: string) => !id || id.startsWith('new-');

function toSeed(msg: ChatMessageDto): ChatMessageSeed {
  return {
    id: msg.id,
    role: msg.role,
    agent: msg.agent_id ?? undefined,
    content: msg.content as ReactNode,
    copyText: msg.content,
    time: formatTime(msg.created_at),
  };
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

interface UseChatOptions {
  initialAgentId?: AgentId;
}

export function useChat(chatId?: string, opts: UseChatOptions = {}) {
  const fresh = isNewThread(chatId);
  const [, navigate] = useLocation();
  const [agentId, setAgentId] = useState<AgentId>(opts.initialAgentId ?? 'storyteller');
  const [messages, setMessages] = useState<ChatMessageSeed[]>([]);
  const [draft, setDraft] = useState('');
  const [inputState, setInputState] = useState<InputState>('idle');
  const [chatTitle, setChatTitle] = useState<string>(fresh ? 'New thread' : 'Loading…');
  const [error, setError] = useState<string | null>(null);
  const loadedFor = useRef<string | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
      streamAbortRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
      streamAbortRef.current = null;
    };
  }, [chatId]);

  useEffect(() => {
    if (fresh) {
      setMessages([]);
      setChatTitle('New thread');
      loadedFor.current = null;
      return;
    }
    if (!chatId || loadedFor.current === chatId) return;
    loadedFor.current = chatId;
    let cancelled = false;
    void (async () => {
      try {
        const detail = await chatsApi.getChat(chatId);
        if (cancelled) return;
        setAgentId(detail.agent_id);
        setMessages(detail.messages.map(toSeed));
        setChatTitle(detail.title ?? 'Untitled thread');
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load chat');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chatId, fresh]);

  const send = useCallback(
    async (text: string) => {
      const body = text.trim();
      if (!body) return;
      const token = useAuthStore.getState().tokens?.access;
      if (!token) {
        setError('Not authenticated');
        return;
      }
      setError(null);

      let targetChatId = chatId;
      if (!targetChatId || isNewThread(targetChatId)) {
        const created = await chatsApi.createChat(agentId);
        targetChatId = created.id;
        loadedFor.current = created.id;
        navigate(`/chat/${created.id}`, { replace: true });
      }

      const now = Date.now();
      const userMsgId = `u-${now}`;
      const assistantMsgId = `a-${now}`;
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: 'user', content: body, copyText: body, time: 'just now' },
        {
          id: assistantMsgId,
          role: 'assistant',
          agent: agentId,
          streaming: true,
          content: '',
          copyText: '',
        },
      ]);
      setDraft('');
      setInputState('idle');

      streamAbortRef.current?.abort();
      const controller = new AbortController();
      streamAbortRef.current = controller;

      let collected = '';
      try {
        await chatsApi.streamChatMessage(
          targetChatId,
          body,
          agentId,
          token,
          (chunk) => {
            collected += chunk;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: collected, copyText: collected, streaming: true }
                  : m,
              ),
            );
          },
          controller.signal,
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: collected, copyText: collected, streaming: false }
              : m,
          ),
        );
      } catch (e) {
        const aborted =
          (e instanceof DOMException && e.name === 'AbortError') ||
          (e instanceof Error && e.name === 'AbortError');
        if (aborted) {
          return;
        }
        const errorMarker = '\n\n⚠️ Stream interrupted.';
        const finalContent = collected
          ? `${collected}${errorMarker}`
          : 'Sorry, there was an error.';
        setError(e instanceof Error ? e.message : 'Streaming failed');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: finalContent,
                  copyText: finalContent,
                  streaming: false,
                }
              : m,
          ),
        );
      } finally {
        if (streamAbortRef.current === controller) {
          streamAbortRef.current = null;
        }
      }
    },
    [agentId, chatId, navigate],
  );

  const toggleMic = useCallback(() => {
    setInputState((s) => (s === 'idle' ? 'listening' : 'idle'));
  }, []);

  const rotateAgent = useCallback(() => {
    const ids: AgentId[] = ['storyteller', 'conversation', 'oral', 'health', 'backtrans'];
    setAgentId((cur) => ids[(ids.indexOf(cur) + 1) % ids.length]);
  }, []);

  const agent: Agent = useMemo(() => AGENT_BY_ID[agentId], [agentId]);

  return {
    chatTitle,
    isNew: fresh,
    agent,
    rotateAgent,
    messages,
    draft,
    setDraft,
    send,
    inputState,
    setInputState,
    toggleMic,
    error,
  };
}
