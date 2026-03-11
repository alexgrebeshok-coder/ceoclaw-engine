import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  badRequest,
  databaseUnavailable,
  notFound,
  serverError,
} from "@/lib/server/api-utils";
import { getServerRuntimeState } from "@/lib/server/runtime-mode";

/**
 * PUT /api/tasks/[id]/move — Move task to another column
 * 
 * Body: { columnId: string, order?: number }
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { columnId, order } = body;
    const runtime = getServerRuntimeState();

    if (!columnId) {
      return badRequest("columnId is required");
    }

    if (runtime.usingMockData) {
      const { getMockTasks } = await import("@/lib/mock-data");
      const mockTask = getMockTasks().find((task) => task.id === id);
      if (!mockTask) {
        return notFound("Task not found");
      }

      return NextResponse.json({
        ...mockTask,
        columnId,
        order: order ?? mockTask.order,
        status: inferMockStatusFromColumnId(columnId),
      });
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    // Get current task
    const task = await prisma.task.findUnique({
      where: { id },
      select: { columnId: true, order: true },
    });

    if (!task) {
      return notFound("Task not found");
    }

    // If moving to same column, just update order
    // If moving to different column, update columnId and order

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        columnId,
        order: order ?? task.order,
        // Update status based on column
        status: await getColumnStatus(columnId),
      },
      include: {
        assignee: {
          select: { id: true, name: true, initials: true, avatar: true },
        },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("[Task Move API] Error:", error);
    return serverError(error, "Failed to move task.");
  }
}

/**
 * Get task status based on column
 */
async function getColumnStatus(columnId: string): Promise<string> {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    select: { title: true },
  });

  if (!column) return "todo";

  const title = column.title.toLowerCase();
  if (title.includes("done")) return "done";
  if (title.includes("progress")) return "in_progress";
  if (title.includes("review")) return "in_progress";
  return "todo";
}

function inferMockStatusFromColumnId(columnId: string): string {
  const normalized = columnId.toLowerCase();
  if (normalized.includes("done")) return "done";
  if (normalized.includes("progress") || normalized.includes("review")) {
    return "in-progress";
  }
  return "todo";
}
