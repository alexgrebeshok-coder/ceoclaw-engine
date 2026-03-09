import type { AIRunRecord } from "@/lib/ai/types";

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  runIds: string[];
}

export interface PersistedChatState {
  sessions: ChatSession[];
  runs: AIRunRecord[];
  currentSessionId: string | null;
  selectedRunId: string | null;
}
