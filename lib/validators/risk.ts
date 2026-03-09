import { z } from "zod";

export const riskLevelSchema = z.enum(["low", "medium", "high"]);
export const riskStatusSchema = z.enum(["open", "mitigated", "closed"]);

export const createRiskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional(),
  projectId: z.string().trim().min(1),
  ownerId: z.string().trim().min(1).nullable().optional(),
  probability: riskLevelSchema.optional(),
  impact: riskLevelSchema.optional(),
  status: riskStatusSchema.optional(),
});
