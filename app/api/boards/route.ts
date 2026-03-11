import { NextRequest, NextResponse } from "next/server";

import { buildMockBoards } from "@/lib/mock-boards";
import { prisma } from "@/lib/prisma";
import { badRequest, databaseUnavailable, serverError } from "@/lib/server/api-utils";
import { getServerRuntimeState } from "@/lib/server/runtime-mode";

/**
 * GET /api/boards — List all boards
 * POST /api/boards — Create new board
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const runtime = getServerRuntimeState();

    if (runtime.usingMockData) {
      const boards = buildMockBoards();
      return NextResponse.json(
        projectId ? boards.filter((board) => board.projectId === projectId) : boards
      );
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    const boards = await prisma.board.findMany({
      where: projectId ? { projectId } : undefined,
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(boards);
  } catch (error) {
    console.error("[Boards API] Error:", error);
    return serverError(error, "Failed to fetch boards.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, projectId } = body;
    const runtime = getServerRuntimeState();

    if (runtime.usingMockData) {
      const boards = buildMockBoards();
      const createdBoard =
        boards.find((board) => board.projectId === projectId) ?? boards[0] ?? null;

      if (!createdBoard) {
        return NextResponse.json(
          { error: "Cannot create board without projects" },
          { status: 400 }
        );
      }

      return NextResponse.json(createdBoard, { status: 201 });
    }

    if (!name || !projectId) {
      return badRequest("Name and projectId are required");
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    // Create board with default columns
    const board = await prisma.board.create({
      data: {
        name,
        projectId,
        columns: {
          create: [
            { title: "To Do", order: 0, color: "#6b7280" },
            { title: "In Progress", order: 1, color: "#3b82f6" },
            { title: "Review", order: 2, color: "#f59e0b" },
            { title: "Done", order: 3, color: "#10b981" },
          ],
        },
      },
      include: {
        columns: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error("[Boards API] Error:", error);
    return serverError(error, "Failed to create board.");
  }
}
