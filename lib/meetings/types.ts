import type { AIRunInput, AIRunRecord } from "@/lib/ai/types";
import type { Locale } from "@/lib/translations";

export type MeetingRunPurpose = "tasks" | "risks" | "status";

export interface MeetingToActionRequest {
  projectId: string;
  title?: string;
  notes: string;
  participants?: string[];
  locale?: Locale;
  interfaceLocale?: Locale;
}

export interface MeetingRunBlueprint {
  purpose: MeetingRunPurpose;
  label: string;
  input: AIRunInput;
}

export interface MeetingToActionPacketRun {
  purpose: MeetingRunPurpose;
  label: string;
  pollPath: string;
  run: AIRunRecord;
}

export interface MeetingToActionPacket {
  packetId: string;
  createdAt: string;
  projectId: string;
  projectName: string;
  title: string;
  participants: string[];
  noteStats: {
    characters: number;
    lines: number;
  };
  runs: MeetingToActionPacketRun[];
}
