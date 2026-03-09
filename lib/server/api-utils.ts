import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const projectStatusMap: Record<string, string> = {
  active: "active",
  planning: "planning",
  completed: "completed",
  "on-hold": "on_hold",
  on_hold: "on_hold",
  "at-risk": "at_risk",
  at_risk: "at_risk",
};

const taskStatusMap: Record<string, string> = {
  todo: "todo",
  blocked: "blocked",
  done: "done",
  cancelled: "cancelled",
  "in-progress": "in_progress",
  in_progress: "in_progress",
};

const milestoneStatusMap: Record<string, string> = {
  upcoming: "upcoming",
  completed: "completed",
  overdue: "overdue",
  "in-progress": "in_progress",
  in_progress: "in_progress",
};

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function validationError(error: z.ZodError): NextResponse {
  return NextResponse.json(
    {
      error: "Validation failed",
      details: error.flatten(),
      code: "VALIDATION_ERROR",
    },
    { status: 400 }
  );
}

export function serverError(error: unknown, fallback: string): NextResponse {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallback },
    { status: 500 }
  );
}

export function isPrismaNotFoundError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

export function normalizeProjectStatus(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return projectStatusMap[value.trim()];
}

export function normalizeTaskStatus(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return taskStatusMap[value.trim()];
}

export function normalizeMilestoneStatus(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return milestoneStatusMap[value.trim()];
}

export function parseDateInput(value: unknown): Date | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed;
}

export function parseOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export function parseOptionalInteger(value: unknown): number | undefined {
  const parsed = parseOptionalNumber(value);
  if (parsed === undefined) return undefined;
  return Math.round(parsed);
}

export function calculateProjectProgress(input: {
  progress?: number | null;
  tasks?: Array<{ status: string }>;
}): number {
  if (typeof input.progress === "number" && Number.isFinite(input.progress)) {
    return Math.max(0, Math.min(100, Math.round(input.progress)));
  }

  const tasks = input.tasks ?? [];
  if (!tasks.length) return 0;

  const doneCount = tasks.filter((task) => task.status === "done").length;
  return Math.round((doneCount / tasks.length) * 100);
}

export function calculateProjectHealth(input: {
  health?: string | null;
  risks?: Array<{ severity?: number | null; status?: string | null }>;
}): string {
  const openRisks = (input.risks ?? []).filter(
    (risk) => !risk.status || risk.status === "open"
  );

  if (openRisks.some((risk) => (risk.severity ?? 0) >= 5)) {
    return "critical";
  }

  if (openRisks.some((risk) => (risk.severity ?? 0) >= 3)) {
    return "warning";
  }

  return input.health && typeof input.health === "string" ? input.health : "good";
}
