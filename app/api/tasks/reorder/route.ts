import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  databaseUnavailable,
  normalizeTaskStatus,
  serverError,
  validationError,
} from "@/lib/server/api-utils";
import { getServerRuntimeState } from "@/lib/server/runtime-mode";
import { reorderTasksSchema } from "@/lib/validators/task";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = reorderTasksSchema.safeParse(body);
    const runtime = getServerRuntimeState();

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    if (runtime.usingMockData) {
      const count = Object.values(parsed.data.columns).reduce(
        (sum, taskIds) => sum + taskIds.length,
        0
      );

      return NextResponse.json({ reordered: true, count });
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    const updates = Object.entries(parsed.data.columns).flatMap(([statusKey, taskIds]) => {
      const status = normalizeTaskStatus(statusKey);
      if (!status || !Array.isArray(taskIds)) return [];

      return taskIds.map((taskId, index) =>
        prisma.task.update({
          where: { id: taskId },
          data: {
            status,
            order: index,
            updatedAt: new Date(),
          },
        })
      );
    });

    await prisma.$transaction(updates);

    return NextResponse.json({
      reordered: true,
      count: updates.length,
    });
  } catch (error) {
    return serverError(error, "Failed to reorder tasks.");
  }
}
