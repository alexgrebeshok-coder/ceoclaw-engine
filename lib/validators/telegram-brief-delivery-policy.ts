import { z } from "zod";

import { isSupportedTimeZone } from "@/lib/briefs/telegram-delivery-policies";

const timezoneSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => isSupportedTimeZone(value), {
    message: "timezone must be a valid IANA timezone.",
  });

const scopeSchema = z.enum(["portfolio", "project"]);
const cadenceSchema = z.enum(["daily", "weekdays"]);
const localeSchema = z.enum(["ru", "en"]);

export const telegramBriefDeliveryPolicyCreateSchema = z
  .object({
    scope: scopeSchema,
    projectId: z.string().trim().min(1).optional().nullable(),
    locale: localeSchema.optional(),
    chatId: z.string().trim().min(1).optional().nullable(),
    cadence: cadenceSchema.optional(),
    timezone: timezoneSchema,
    deliveryHour: z.number().int().min(0).max(23),
    active: z.boolean().optional(),
  })
  .superRefine((value, context) => {
    if (value.scope === "project" && !value.projectId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "projectId is required for project scope.",
        path: ["projectId"],
      });
    }
  });

export const telegramBriefDeliveryPolicyUpdateSchema = z
  .object({
    scope: scopeSchema.optional(),
    projectId: z.string().trim().min(1).optional().nullable(),
    locale: localeSchema.optional(),
    chatId: z.string().trim().min(1).optional().nullable(),
    cadence: cadenceSchema.optional(),
    timezone: timezoneSchema.optional(),
    deliveryHour: z.number().int().min(0).max(23).optional(),
    active: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided.",
  })
  .superRefine((value, context) => {
    if (value.scope === "project" && !value.projectId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "projectId is required when switching to project scope.",
        path: ["projectId"],
      });
    }
  });
