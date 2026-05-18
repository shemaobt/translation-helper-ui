import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { AGENT_BY_ID, AGENT_IDS, type Agent, type AgentId } from '../agents';
import { chatsApi } from '../api';
import type { ChatMessageDto } from '../api/types';
import type { ChatMessageSeed } from '../fixtures';
import { useAuthStore } from '../stores/authStore';
import { useChatHistoryStore } from '../stores/chatHistoryStore';

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
  const { t } = useTranslation();
  const fresh = isNewThread(chatId);
  const [, navigate] = useLocation();
  const [agentId, setAgentId] = useState<AgentId>(opts.initialAgentId ?? 'storyteller');
  const [messages, setMessages] = useState<ChatMessageSeed[]>([]);
  const [draft, setDraft] = useState('');
  const [inputState, setInputState] = useState<InputState>('idle');
  const [chatTitle, setChatTitle] = useState<string>(
    fresh ? t('chat.newThread') : t('common.loading'),
  );
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const loadedFor = useRef<string | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);
  // chatId the in-flight stream is targeting. Lets the chatId-change effect
  // tell the difference between "user navigated to a different chat (abort
  // the leftover stream)" and "send() just navigated to its own new chat
  // (let the stream keep running)".
  const activeStreamChatId = useRef<string | null>(null);

  // Unmount-only abort. Covers the user leaving /chat/* entirely.
  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
      streamAbortRef.current = null;
      activeStreamChatId.current = null;
    };
  }, []);

  // Cross-chat abort. If chatId changes and the in-flight stream is for a
  // different chat, abort it so its chunks don't bleed into the new chat's view.
  useEffect(() => {
    const active = activeStreamChatId.current;
    if (active && chatId && active !== chatId) {
      streamAbortRef.current?.abort();
      streamAbortRef.current = null;
      activeStreamChatId.current = null;
    }
  }, [chatId]);

  useEffect(() => {
    if (fresh) {
      setMessages([]);
      setChatTitle(t('chat.newThread'));
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
        setChatTitle(detail.title ?? t('chat.untitledThread'));
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : t('chat.failedToLoadChat'));
        setMessages([]);
        setChatTitle(t('chat.couldNotLoadTitle'));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chatId, fresh, t]);

  const send = useCallback(
    async (text: string) => {
      const body = text.trim();
      if (!body) return;
      if (isStreaming) return;
      const token = useAuthStore.getState().tokens?.access;
      if (!token) {
        setError(t('chat.notAuthenticated'));
        return;
      }
      setError(null);

      let targetChatId = chatId;
      if (!targetChatId || isNewThread(targetChatId)) {
        const created = await chatsApi.createChat(agentId);
        targetChatId = created.id;
        loadedFor.current = created.id;
        // Mark our stream's target BEFORE navigate so the chatId-change
        // effect can see this is our own navigation and skip the abort.
        activeStreamChatId.current = created.id;
        navigate(`/chat/${created.id}`, { replace: true });
        // Fire-and-forget: surface the new chat in Sidebar + /history immediately.
        void useChatHistoryStore.getState().refresh();
      } else {
        activeStreamChatId.current = targetChatId;
      }

      const now = Date.now();
      const userMsgId = `u-${now}`;
      const assistantMsgId = `a-${now}`;
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: 'user', content: body, copyText: body, time: t('chat.justNow') },
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
      setIsStreaming(true);

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
        // Refresh history so the sidebar reflects the new title + timestamp.
        void useChatHistoryStore.getState().refresh();
      } catch (e) {
        const aborted =
          (e instanceof DOMException && e.name === 'AbortError') ||
          (e instanceof Error && e.name === 'AbortError');
        if (aborted) {
          return;
        }
        const errorMarker = t('chat.streamInterrupted');
        const finalContent = collected
          ? `${collected}${errorMarker}`
          : t('chat.sorryError');
        setError(e instanceof Error ? e.message : t('chat.streamingFailed'));
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
        if (activeStreamChatId.current === targetChatId) {
          activeStreamChatId.current = null;
        }
        setIsStreaming(false);
      }
    },
    [agentId, chatId, isStreaming, navigate, t],
  );

  const toggleMic = useCallback(() => {
    setInputState((s) => (s === 'idle' ? 'listening' : 'idle'));
  }, []);

  const rotateAgent = useCallback(() => {
    setAgentId((cur) => AGENT_IDS[(AGENT_IDS.indexOf(cur) + 1) % AGENT_IDS.length]);
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
    isStreaming,
  };
}
