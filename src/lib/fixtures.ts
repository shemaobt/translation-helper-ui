import type { AgentId } from './agents';
import type { ReactNode } from 'react';

export interface CurrentUserProfile {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  role: string;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  agentId: AgentId;
  preview: string;
  lastMessageAt: Date;
}

export interface ChatMessageSeed {
  id: string;
  role: 'user' | 'assistant';
  agent?: AgentId;
  content: ReactNode;
  copyText?: string;
  time?: string;
  streaming?: boolean;
}
