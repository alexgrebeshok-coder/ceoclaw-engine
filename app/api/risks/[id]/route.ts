import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  databaseUnavailable,
  isPrismaNotFoundError,
  notFound,
  serverError,
} from "@/lib/server/api-utils";
import { getServerRuntimeState } from "@/lib/server/runtime-mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const severityMap: Record<string, number> = {
  low: 1,
  medium: 3,
  high: 5,
};

function resolveSeverity(probability?: string, impact?: string) {
  const probabilityScore = severityMap[probability ?? "medium"] ?? severityMap.medium;
  const impactScore = severityMap[impact ?? "medium"] ?? severityMap.medium;
  return Math.round((probabilityScore + impactScore) / 2);
}

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
    const risk = await prisma.risk.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true },
        },
        owner: {
          select: { id: true, name: true, initials: true },
        },
      },
    });

    if (!risk) {
      return notFound("Risk not found");
    }

    return NextResponse.json(risk);
  } catch (error) {
    return serverError(error, "Failed to load risk.");
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
    const current = await prisma.risk.findUnique({
      where: { id },
      select: { probability: true, impact: true },
    });

    if (!current) {
      return notFound("Risk not found");
    }

    const probability =
      typeof body.probability === "string" ? body.probability : current.probability;
    const impact = typeof body.impact === "string" ? body.impact : current.impact;

    const risk = await prisma.risk.update({
      where: { id },
      data: {
        ...(typeof body.title === "string" && { title: body.title }),
        ...(body.description !== undefined && {
          description:
            typeof body.description === "string" ? body.description : null,
        }),
        ...(typeof body.status === "string" && { status: body.status }),
        ...(typeof body.ownerId === "string" && { ownerId: body.ownerId }),
        ...(body.ownerId === null && { ownerId: null }),
        ...(typeof body.projectId === "string" && { projectId: body.projectId }),
        ...(typeof body.probability === "string" && { probability }),
        ...(typeof body.impact === "string" && { impact }),
        severity: resolveSeverity(probability, impact),
        updatedAt: new Date(),
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        owner: {
          select: { id: true, name: true, initials: true },
        },
      },
    });

    return NextResponse.json(risk);
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      return notFound("Risk not found");
    }

    return serverError(error, "Failed to update risk.");
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
    await prisma.risk.delete({
      where: { id },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      return notFound("Risk not found");
    }

    return serverError(error, "Failed to delete risk.");
  }
}
