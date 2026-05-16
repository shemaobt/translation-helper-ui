import type { AgentId } from '../agents';

export type ChatMessageRole = 'user' | 'assistant';

export interface CurrentUser {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  is_platform_admin: boolean;
  locale: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccessRequestResponse {
  id: string;
  user_id: string;
  app_id: string;
  status: string;
  note: string | null;
  requested_at: string;
  reviewed_at: string | null;
}

export interface AppInfo {
  id: string;
  app_key: string;
  name: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: CurrentUser;
}

export interface SignupPayload {
  email: string;
  password: string;
  display_name: string;
  locale?: string;
}

export interface AgentInfo {
  id: AgentId;
  name: string;
  description: string;
  short: string;
  icon: string;
  starters: string[];
  prompt_version: number | null;
}

export interface ChatSummary {
  id: string;
  user_id: string;
  agent_id: AgentId;
  title: string | null;
  created_at: string;
  updated_at: string;
  last_message_preview: string | null;
  last_message_at: string | null;
}

export interface ChatMessageDto {
  id: string;
  chat_id: string;
  role: ChatMessageRole;
  content: string;
  agent_id: AgentId | null;
  created_at: string;
}

export interface ChatDetail extends ChatSummary {
  messages: ChatMessageDto[];
}

export interface AgentPrompt {
  id: string;
  agent_id: string;
  name: string;
  description: string;
  prompt: string;
  version: number;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TranscribeResponse {
  text: string;
  duration_sec: number | null;
}

export interface SpeakResponse {
  audio_base64: string;
  mime_type: string;
  etag: string;
  cached: boolean;
}
