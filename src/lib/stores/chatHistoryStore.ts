import { create } from 'zustand';
import { chatsApi } from '../api';
import type { ChatSummary } from '../api/types';

interface ChatHistoryState {
  chats: ChatSummary[];
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  refresh: () => Promise<void>;
  clear: () => void;
}

export const useChatHistoryStore = create<ChatHistoryState>((set) => ({
  chats: [],
  loading: false,
  error: null,
  lastFetchedAt: null,

  refresh: async () => {
    set({ loading: true });
    try {
      const chats = await chatsApi.listChats();
      set({ chats, loading: false, error: null, lastFetchedAt: Date.now() });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to load chat history',
      });
    }
  },

  clear: () => set({ chats: [], loading: false, error: null, lastFetchedAt: null }),
}));
