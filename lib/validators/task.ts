import { z } from "zod";

const isoDateSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Invalid date",
});

export const taskStatusSchema = z.enum(["todo", "blocked", "done", "cancelled", "in-progress", "in_progress"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high", "critical"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional(),
  projectId: z.string().trim().min(1),
  assigneeId: z.string().trim().min(1).nullable().optional(),
  dueDate: isoDateSchema,
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  assigneeId: z.string().trim().min(1).nullable().optional(),
  dueDate: isoDateSchema.optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  order: z.coerce.number().int().min(0).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required",
});

export const reorderTasksSchema = z.object({
  projectId: z.string().trim().min(1),
  columns: z.record(z.string(), z.array(z.string().trim().min(1))),
});
