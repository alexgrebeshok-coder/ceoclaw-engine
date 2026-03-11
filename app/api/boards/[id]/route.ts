import { NextRequest, NextResponse } from "next/server";

import { findMockBoardById } from "@/lib/mock-boards";
import { prisma } from "@/lib/prisma";
import { databaseUnavailable, notFound, serverError } from "@/lib/server/api-utils";
import { getServerRuntimeState } from "@/lib/server/runtime-mode";

/**
 * GET /api/boards/[id] — Get board with columns and tasks
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const runtime = getServerRuntimeState();

    if (runtime.usingMockData) {
      const { id } = await params;
      const board = findMockBoardById(id);

      if (!board) {
        return notFound("Board not found");
      }

      return NextResponse.json(board);
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    const { id } = await params;

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true },
        },
        columns: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              orderBy: { order: "asc" },
              include: {
                assignee: {
                  select: { id: true, name: true, initials: true, avatar: true },
                },
              },
            },
          },
        },
      },
    });

    if (!board) {
      return notFound("Board not found");
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error("[Board API] Error:", error);
    return serverError(error, "Failed to fetch board.");
  }
}
