import { z } from "zod";

const isoDateSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Invalid date",
});

const optionalTrimmedString = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal("").transform(() => undefined));

const optionalNullableTrimmedString = (max: number) =>
  z.union([z.string().trim().max(max), z.null(), z.literal("")]).optional();

export const workReportStatusSchema = z.enum(["submitted", "approved", "rejected"]);

export const workReportVolumeSchema = z.object({
  description: z.string().trim().min(1).max(500),
  value: z.coerce.number().finite().optional(),
  unit: optionalTrimmedString(50),
  note: optionalTrimmedString(500),
});

export const workReportAttachmentSchema = z.object({
  id: optionalTrimmedString(100),
  name: optionalTrimmedString(255),
  url: optionalTrimmedString(2000),
  mimeType: optionalTrimmedString(100),
  size: z.coerce.number().int().min(0).optional(),
  type: optionalTrimmedString(50),
});

export const createWorkReportSchema = z.object({
  projectId: z.string().trim().min(1),
  authorId: z.string().trim().min(1),
  section: z.string().trim().min(1).max(255),
  reportDate: isoDateSchema,
  workDescription: z.string().trim().min(1).max(5000),
  volumes: z.array(workReportVolumeSchema).max(100).optional(),
  personnelCount: z.coerce.number().int().min(0).max(100000).optional(),
  personnelDetails: optionalTrimmedString(5000),
  equipment: optionalTrimmedString(5000),
  weather: optionalTrimmedString(500),
  issues: optionalTrimmedString(5000),
  nextDayPlan: optionalTrimmedString(5000),
  attachments: z.array(workReportAttachmentSchema).max(100).optional(),
  reportNumber: optionalTrimmedString(64),
  status: workReportStatusSchema.optional(),
  source: z.enum(["manual", "telegram_bot", "import"]).optional(),
  externalReporterTelegramId: optionalTrimmedString(64),
  externalReporterName: optionalTrimmedString(255),
});

export const updateWorkReportSchema = z.object({
  section: z.string().trim().min(1).max(255).optional(),
  reportDate: isoDateSchema.optional(),
  workDescription: z.string().trim().min(1).max(5000).optional(),
  volumes: z.array(workReportVolumeSchema).max(100).optional(),
  personnelCount: z.union([z.coerce.number().int().min(0).max(100000), z.null()]).optional(),
  personnelDetails: optionalNullableTrimmedString(5000),
  equipment: optionalNullableTrimmedString(5000),
  weather: optionalNullableTrimmedString(500),
  issues: optionalNullableTrimmedString(5000),
  nextDayPlan: optionalNullableTrimmedString(5000),
  attachments: z.array(workReportAttachmentSchema).max(100).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required",
});

export const reviewWorkReportSchema = z.object({
  reviewerId: z.string().trim().min(1),
  reviewComment: z.union([z.string().trim().max(5000), z.null(), z.literal("")]).optional(),
});

export const rejectWorkReportSchema = reviewWorkReportSchema.refine(
  (value) => typeof value.reviewComment === "string" && value.reviewComment.trim().length > 0,
  {
    message: "reviewComment is required when rejecting a report",
    path: ["reviewComment"],
  }
);

export const legacyAIPMOBotWorkReportSchema = z.object({
  report_id: optionalTrimmedString(64),
  project_name: z.string().trim().min(1).max(255),
  section: z.string().trim().min(1).max(255),
  report_date: isoDateSchema,
  work_description: z.string().trim().min(1).max(5000),
  reporter_telegram_id: z.union([z.number().int(), z.string().trim().min(1)]),
  reporter_name: optionalTrimmedString(255),
  volumes: z.array(workReportVolumeSchema).max(100).optional(),
  personnel_count: z.union([z.coerce.number().int().min(0).max(100000), z.null()]).optional(),
  personnel_details: optionalNullableTrimmedString(5000),
  equipment: optionalNullableTrimmedString(5000),
  weather: optionalNullableTrimmedString(500),
  issues: optionalNullableTrimmedString(5000),
  next_day_plan: optionalNullableTrimmedString(5000),
  attachments: z.array(workReportAttachmentSchema).max(100).optional(),
  status: workReportStatusSchema.optional(),
});
