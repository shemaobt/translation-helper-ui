import { useEffect, useState } from 'react';
import { chatsApi } from '../api';
import type { ChatSummary } from '../api/types';

interface State {
  chats: ChatSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useChatHistory(): State {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await chatsApi.listChats();
      setChats(rows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return { chats, loading, error, refresh: load };
}
