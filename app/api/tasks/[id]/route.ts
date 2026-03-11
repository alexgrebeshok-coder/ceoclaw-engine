import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  databaseUnavailable,
  isPrismaNotFoundError,
  normalizeTaskStatus,
  notFound,
  serverError,
  validationError,
} from "@/lib/server/api-utils";
import { getServerRuntimeState } from "@/lib/server/runtime-mode";
import { updateTaskSchema } from "@/lib/validators/task";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  try {
    const runtime = getServerRuntimeState();

    if (runtime.usingMockData) {
      const { id } = await params;
      const mockTask = await buildMockTaskDetail(id);
      if (!mockTask) {
        return notFound("Task not found");
      }

      return NextResponse.json(mockTask);
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, direction: true },
        },
        assignee: {
          select: { id: true, name: true, initials: true },
        },
      },
    });

    if (!task) {
      return notFound("Task not found");
    }

    return NextResponse.json(task);
  } catch (error) {
    return serverError(error, "Failed to load task.");
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  try {
    const runtime = getServerRuntimeState();

    if (runtime.usingMockData) {
      const { id } = await params;
      const mockTask = await buildMockTaskDetail(id);
      if (!mockTask) {
        return notFound("Task not found");
      }

      return NextResponse.json(mockTask);
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { assigneeId, description, dueDate, order, priority, status, title } = parsed.data;
    const nextStatus = normalizeTaskStatus(status);

    let orderUpdate: Record<string, unknown> = {};
    if (nextStatus) {
      const currentTask = await prisma.task.findUnique({
        where: { id },
        select: { id: true, projectId: true, status: true },
      });

      if (!currentTask) {
        return notFound("Task not found");
      }

      if (currentTask.status !== nextStatus) {
        const maxOrder = await prisma.task.aggregate({
          where: {
            projectId: currentTask.projectId,
            status: nextStatus,
          },
          _max: { order: true },
        });

        orderUpdate = { order: (maxOrder._max.order ?? -1) + 1 };
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(nextStatus && { status: nextStatus, ...orderUpdate }),
        ...(priority !== undefined && { priority }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
        ...(order !== undefined && { order }),
        ...(nextStatus === "done"
          ? { completedAt: new Date() }
          : nextStatus
            ? { completedAt: null }
            : {}),
        updatedAt: new Date(),
      },
      include: {
        project: {
          select: { id: true, name: true, direction: true },
        },
        assignee: {
          select: { id: true, name: true, initials: true },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      return notFound("Task not found");
    }

    return serverError(error, "Failed to update task.");
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  try {
    const runtime = getServerRuntimeState();

    if (runtime.usingMockData) {
      return NextResponse.json({ deleted: true });
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    const { id } = await params;
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      return notFound("Task not found");
    }

    return serverError(error, "Failed to delete task.");
  }
}

async function buildMockTaskDetail(taskId: string) {
  const { getMockTasks, getMockProjects } = await import("@/lib/mock-data");
  const task = getMockTasks().find((item) => item.id === taskId);

  if (!task) {
    return null;
  }

  const project = getMockProjects().find((item) => item.id === task.projectId);

  return {
    ...task,
    project: project
      ? {
          id: project.id,
          name: project.name,
          direction: project.direction,
        }
      : null,
    assignee: task.assignee,
  };
}
