import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  badRequest,
  databaseUnavailable,
  serverError,
} from "@/lib/server/api-utils";
import { getServerRuntimeState } from "@/lib/server/runtime-mode";

/**
 * GET /api/tasks/[id]/dependencies — Get task dependencies
 * POST /api/tasks/[id]/dependencies — Add dependency
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const runtime = getServerRuntimeState();

    if (runtime.usingMockData) {
      return NextResponse.json({ dependencies: [], dependents: [] });
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    const { id } = await params;

    const dependencies = await prisma.taskDependency.findMany({
      where: { taskId: id },
      include: {
        dependsOnTask: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
          },
        },
      },
    });

    const dependents = await prisma.taskDependency.findMany({
      where: { dependsOnTaskId: id },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
          },
        },
      },
    });

    return NextResponse.json({
      dependencies: dependencies.map((d) => ({
        id: d.id,
        type: d.type,
        task: d.dependsOnTask,
      })),
      dependents: dependents.map((d) => ({
        id: d.id,
        type: d.type,
        task: d.task,
      })),
    });
  } catch (error) {
    console.error("[Dependencies API] Error:", error);
    return serverError(error, "Failed to fetch task dependencies.");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { dependsOnTaskId, type = "FINISH_TO_START" } = body;
    const runtime = getServerRuntimeState();

    if (!dependsOnTaskId) {
      return badRequest("dependsOnTaskId is required");
    }

    if (runtime.usingMockData) {
      return NextResponse.json(
        {
          id: `mock-dependency-${id}-${dependsOnTaskId}`,
          taskId: id,
          dependsOnTaskId,
          type,
        },
        { status: 201 }
      );
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    // Check for circular dependency
    const hasCircular = await checkCircularDependency(id, dependsOnTaskId);
    if (hasCircular) {
      return badRequest("Circular dependency detected");
    }

    // Check if dependency already exists
    const existing = await prisma.taskDependency.findUnique({
      where: {
        taskId_dependsOnTaskId: {
          taskId: id,
          dependsOnTaskId,
        },
      },
    });

    if (existing) {
      return badRequest("Dependency already exists");
    }

    const dependency = await prisma.taskDependency.create({
      data: {
        taskId: id,
        dependsOnTaskId,
        type,
      },
      include: {
        dependsOnTask: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
          },
        },
      },
    });

    return NextResponse.json(dependency, { status: 201 });
  } catch (error) {
    console.error("[Dependencies API] Error:", error);
    return serverError(error, "Failed to create task dependency.");
  }
}

/**
 * Check for circular dependency using DFS
 */
async function checkCircularDependency(
  taskId: string,
  dependsOnTaskId: string
): Promise<boolean> {
  // If A depends on B, check if B (directly or indirectly) depends on A
  const visited = new Set<string>();
  const stack = [dependsOnTaskId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    
    if (current === taskId) {
      return true; // Circular dependency found
    }

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);

    // Get all tasks that current depends on
    const deps = await prisma.taskDependency.findMany({
      where: { taskId: current },
      select: { dependsOnTaskId: true },
    });

    stack.push(...deps.map((d) => d.dependsOnTaskId));
  }

  return false;
}
