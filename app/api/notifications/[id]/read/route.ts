import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  databaseUnavailable,
  notFound,
  serverError,
} from "@/lib/server/api-utils";
import { getServerRuntimeState } from "@/lib/server/runtime-mode";

/**
 * PUT /api/notifications/[id]/read
 * Mark notification as read
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const runtime = getServerRuntimeState();

    if (runtime.usingMockData) {
      const { id: notificationId } = await params;
      return NextResponse.json({
        id: notificationId,
        read: true,
        readAt: new Date().toISOString(),
        mock: true,
      });
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    const { id: notificationId } = await params;

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("[Notifications Read API] Error:", error);
    if (error instanceof Error && /record to update not found/i.test(error.message)) {
      return notFound("Notification not found");
    }

    return serverError(error, "Failed to mark notification as read");
  }
}
