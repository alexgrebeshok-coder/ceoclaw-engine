import { z } from "zod";

const isoDateSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Invalid date",
});

export const projectDirectionSchema = z.enum(["metallurgy", "logistics", "trade", "construction"]);
export const projectStatusSchema = z.enum(["active", "planning", "completed", "on-hold", "at-risk", "on_hold", "at_risk"]);
export const projectPrioritySchema = z.enum(["low", "medium", "high", "critical"]);

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().max(5000).optional(),
  direction: projectDirectionSchema,
  status: projectStatusSchema.optional(),
  priority: projectPrioritySchema.optional(),
  start: isoDateSchema,
  end: isoDateSchema,
  budgetPlan: z.coerce.number().finite().nonnegative().optional(),
  budgetFact: z.coerce.number().finite().nonnegative().optional(),
  progress: z.coerce.number().int().min(0).max(100).optional(),
  health: z.string().max(32).optional(),
  location: z.string().max(200).optional(),
  teamIds: z.array(z.string().trim().min(1)).optional(),
});

export const updateProjectSchema = createProjectSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field is required" }
);
