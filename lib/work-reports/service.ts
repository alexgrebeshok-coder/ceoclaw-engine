import { prisma } from "@/lib/prisma";

import { serializeJsonArray, serializeWorkReportRecord } from "./mapper";
import type {
  CreateWorkReportInput,
  UpdateWorkReportInput,
  WorkReportQuery,
  WorkReportStatus,
} from "./types";

const includeShape = {
  project: {
    select: { id: true, name: true },
  },
  author: {
    select: { id: true, name: true, initials: true, role: true },
  },
  reviewer: {
    select: { id: true, name: true, initials: true, role: true },
  },
} as const;

export async function listWorkReports(query: WorkReportQuery = {}) {
  const reports = await prisma.workReport.findMany({
    where: {
      ...(query.projectId && { projectId: query.projectId }),
      ...(query.authorId && { authorId: query.authorId }),
      ...(query.status && { status: query.status }),
      ...(query.reportDate && {
        reportDate: {
          gte: startOfDay(query.reportDate),
          lt: endOfDay(query.reportDate),
        },
      }),
    },
    include: includeShape,
    orderBy: [{ reportDate: "desc" }, { createdAt: "desc" }],
    take: query.limit ?? 50,
  });

  return reports.map(serializeWorkReportRecord);
}

export async function getWorkReportById(id: string) {
  const record = await prisma.workReport.findUnique({
    where: { id },
    include: includeShape,
  });

  return record ? serializeWorkReportRecord(record) : null;
}

export async function createWorkReport(input: CreateWorkReportInput) {
  await ensureProjectExists(input.projectId);
  await ensureMemberExists(input.authorId, "Author");

  const reportNumber =
    input.reportNumber?.trim() || (await generateNextWorkReportNumber(input.reportDate));

  const created = await prisma.workReport.create({
    data: {
      reportNumber,
      projectId: input.projectId,
      authorId: input.authorId,
      section: input.section,
      reportDate: new Date(input.reportDate),
      workDescription: input.workDescription,
      volumesJson: serializeJsonArray(input.volumes),
      personnelCount: input.personnelCount,
      personnelDetails: input.personnelDetails,
      equipment: input.equipment,
      weather: input.weather,
      issues: input.issues,
      nextDayPlan: input.nextDayPlan,
      attachmentsJson: serializeJsonArray(input.attachments),
      status: input.status ?? "submitted",
      source: input.source ?? "manual",
      externalReporterTelegramId: input.externalReporterTelegramId,
      externalReporterName: input.externalReporterName,
    },
    include: includeShape,
  });

  return serializeWorkReportRecord(created);
}

export async function updateWorkReport(
  id: string,
  input: UpdateWorkReportInput
) {
  const existing = await prisma.workReport.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      volumesJson: true,
      attachmentsJson: true,
    },
  });

  if (!existing) {
    throw new Error("Work report not found");
  }

  const updated = await prisma.workReport.update({
    where: { id },
    data: {
      ...(input.section !== undefined && { section: input.section }),
      ...(input.reportDate !== undefined && { reportDate: new Date(input.reportDate) }),
      ...(input.workDescription !== undefined && { workDescription: input.workDescription }),
      ...(input.volumes !== undefined && { volumesJson: serializeJsonArray(input.volumes) }),
      ...(input.personnelCount !== undefined && { personnelCount: input.personnelCount }),
      ...(input.personnelDetails !== undefined && { personnelDetails: normalizeNullable(input.personnelDetails) }),
      ...(input.equipment !== undefined && { equipment: normalizeNullable(input.equipment) }),
      ...(input.weather !== undefined && { weather: normalizeNullable(input.weather) }),
      ...(input.issues !== undefined && { issues: normalizeNullable(input.issues) }),
      ...(input.nextDayPlan !== undefined && { nextDayPlan: normalizeNullable(input.nextDayPlan) }),
      ...(input.attachments !== undefined && {
        attachmentsJson: serializeJsonArray(input.attachments),
      }),
      ...(existing.status !== "submitted"
        ? {
            status: "submitted",
            reviewerId: null,
            reviewComment: null,
            reviewedAt: null,
          }
        : {}),
    },
    include: includeShape,
  });

  return serializeWorkReportRecord(updated);
}

export async function approveWorkReport(
  id: string,
  input: { reviewerId: string; reviewComment?: string | null }
) {
  await ensureMemberExists(input.reviewerId, "Reviewer");

  const updated = await prisma.workReport.update({
    where: { id },
    data: {
      status: "approved",
      reviewerId: input.reviewerId,
      reviewComment: normalizeNullable(input.reviewComment),
      reviewedAt: new Date(),
    },
    include: includeShape,
  });

  return serializeWorkReportRecord(updated);
}

export async function rejectWorkReport(
  id: string,
  input: { reviewerId: string; reviewComment: string }
) {
  await ensureMemberExists(input.reviewerId, "Reviewer");

  const updated = await prisma.workReport.update({
    where: { id },
    data: {
      status: "rejected",
      reviewerId: input.reviewerId,
      reviewComment: input.reviewComment.trim(),
      reviewedAt: new Date(),
    },
    include: includeShape,
  });

  return serializeWorkReportRecord(updated);
}

export async function deleteWorkReport(id: string) {
  await prisma.workReport.delete({
    where: { id },
  });
}

export async function generateNextWorkReportNumber(reportDate: string): Promise<string> {
  const date = new Date(reportDate);
  const prefix = `#${date.toISOString().slice(0, 10).replaceAll("-", "")}`;
  const count = await prisma.workReport.count({
    where: {
      reportNumber: {
        startsWith: prefix,
      },
    },
  });

  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

export function normalizeWorkReportStatus(value: unknown): WorkReportStatus | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  switch (value.trim()) {
    case "submitted":
    case "approved":
    case "rejected":
      return value.trim() as WorkReportStatus;
    default:
      return undefined;
  }
}

function normalizeNullable(value: string | null | undefined): string | null {
  if (value === undefined) {
    return null;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

async function ensureProjectExists(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }
}

async function ensureMemberExists(memberId: string, label: string) {
  const member = await prisma.teamMember.findUnique({
    where: { id: memberId },
    select: { id: true },
  });

  if (!member) {
    throw new Error(`${label} not found`);
  }
}

function startOfDay(value: string): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value: string): Date {
  const date = startOfDay(value);
  date.setDate(date.getDate() + 1);
  return date;
}
