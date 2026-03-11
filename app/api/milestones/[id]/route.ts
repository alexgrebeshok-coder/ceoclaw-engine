import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  databaseUnavailable,
  isPrismaNotFoundError,
  normalizeMilestoneStatus,
  notFound,
  parseDateInput,
  serverError,
} from "@/lib/server/api-utils";
import { getServerRuntimeState } from "@/lib/server/runtime-mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const runtime = getServerRuntimeState();

    if (runtime.usingMockData) {
      return NextResponse.json({});
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    const { id } = await params;
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    if (!milestone) {
      return notFound("Milestone not found");
    }

    return NextResponse.json(milestone);
  } catch (error) {
    return serverError(error, "Failed to load milestone.");
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const runtime = getServerRuntimeState();

    if (runtime.usingMockData) {
      return NextResponse.json({ success: true, id: "mock-id" });
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    const milestone = await prisma.milestone.update({
      where: { id },
      data: {
        ...(typeof body.title === "string" && { title: body.title }),
        ...(body.description !== undefined && {
          description: typeof body.description === "string" ? body.description : null,
        }),
        ...(parseDateInput(body.date) && { date: parseDateInput(body.date) }),
        ...(normalizeMilestoneStatus(body.status) && {
          status: normalizeMilestoneStatus(body.status),
        }),
        updatedAt: new Date(),
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(milestone);
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      return notFound("Milestone not found");
    }

    return serverError(error, "Failed to update milestone.");
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const runtime = getServerRuntimeState();

    if (runtime.usingMockData) {
      return NextResponse.json({ deleted: true });
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    const { id } = await params;
    await prisma.milestone.delete({
      where: { id },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      return notFound("Milestone not found");
    }

    return serverError(error, "Failed to delete milestone.");
  }
}
