import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, databaseUnavailable, notFound, serverError } from "@/lib/server/api-utils";
import { getServerRuntimeState } from "@/lib/server/runtime-mode";

/**
 * PUT /api/time-entries/[id] — Stop timer (set endTime)
 * DELETE /api/time-entries/[id] — Delete time entry
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const runtime = getServerRuntimeState();

    if (runtime.usingMockData) {
      return NextResponse.json({ success: true, id: "mock-id" });
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    const { id } = await params;
    const body = await request.json();
    const { endTime, description } = body;

    const entry = await prisma.timeEntry.findUnique({
      where: { id },
      select: { id: true, startTime: true, endTime: true },
    });

    if (!entry) {
      return notFound("Time entry not found");
    }

    if (entry.endTime) {
      return badRequest("Timer already stopped", "TIMER_ALREADY_STOPPED");
    }

    const now = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor(
      (now.getTime() - entry.startTime.getTime()) / 1000
    );

    const updatedEntry = await prisma.timeEntry.update({
      where: { id },
      data: {
        endTime: now,
        duration,
        description,
      },
      include: {
        task: {
          select: { id: true, title: true },
        },
        member: {
          select: { id: true, name: true, initials: true },
        },
      },
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("[Time Entry Update] Error:", error);
    return serverError(error, "Failed to stop timer");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const runtime = getServerRuntimeState();

    if (runtime.usingMockData) {
      return NextResponse.json({ success: true });
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    const { id } = await params;

    await prisma.timeEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Time Entry Delete] Error:", error);
    return serverError(error, "Failed to delete time entry");
  }
}
