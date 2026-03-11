import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { databaseUnavailable, serverError } from "@/lib/server/api-utils";
import { getServerRuntimeState } from "@/lib/server/runtime-mode";

/**
 * DELETE /api/tasks/[id]/dependencies/[dependencyId] — Remove dependency
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dependencyId: string }> }
) {
  try {
    const runtime = getServerRuntimeState();

    if (runtime.usingMockData) {
      return NextResponse.json({ success: true });
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    const { id, dependencyId } = await params;

    await prisma.taskDependency.delete({
      where: {
        id: dependencyId,
        taskId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Dependency DELETE] Error:", error);
    return serverError(error, "Failed to delete task dependency.");
  }
}
