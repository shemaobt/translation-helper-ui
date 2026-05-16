import { useEffect } from 'react';
import { useChatHistoryStore } from '../stores/chatHistoryStore';

/** Thin wrapper around chatHistoryStore that lazy-loads on first mount.
 *  Multiple consumers share one cached fetch via the store. */
export function useChatHistory() {
  const chats = useChatHistoryStore((s) => s.chats);
  const loading = useChatHistoryStore((s) => s.loading);
  const error = useChatHistoryStore((s) => s.error);
  const lastFetchedAt = useChatHistoryStore((s) => s.lastFetchedAt);
  const refresh = useChatHistoryStore((s) => s.refresh);

  useEffect(() => {
    if (lastFetchedAt === null) void refresh();
  }, [lastFetchedAt, refresh]);

  return { chats, loading, error, refresh };
}
