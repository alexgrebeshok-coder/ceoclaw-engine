import { z } from "zod";

export const meetingToActionSchema = z.object({
  projectId: z.string().trim().min(1),
  title: z.string().trim().min(1).max(200).optional(),
  notes: z.string().trim().min(30).max(20000),
  participants: z.array(z.string().trim().min(1).max(120)).max(20).optional(),
  locale: z.enum(["ru", "en", "zh"]).optional(),
  interfaceLocale: z.enum(["ru", "en", "zh"]).optional(),
});

export type MeetingToActionPayload = z.infer<typeof meetingToActionSchema>;
