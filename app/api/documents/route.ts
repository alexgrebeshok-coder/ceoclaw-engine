import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { badRequest, databaseUnavailable, serverError } from "@/lib/server/api-utils";
import { getServerRuntimeState } from "@/lib/server/runtime-mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildFilename(title: string, type: string) {
  const safeTitle = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  return `${safeTitle || "document"}.${type.toLowerCase()}`;
}

export async function GET(request: NextRequest) {
  try {
    const runtime = getServerRuntimeState();

    if (runtime.usingMockData) {
      return NextResponse.json([]);
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const documents = await prisma.document.findMany({
      where: {
        ...(projectId && { projectId }),
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        owner: {
          select: { id: true, name: true, initials: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    return serverError(error, "Failed to load documents.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const runtime = getServerRuntimeState();

    if (runtime.usingMockData) {
      return NextResponse.json({ success: true, id: "mock-id" });
    }

    if (!runtime.databaseConfigured) {
      return databaseUnavailable(runtime.dataMode);
    }

    const body = (await request.json()) as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const projectId =
      typeof body.projectId === "string" ? body.projectId.trim() : "";
    const type = typeof body.type === "string" && body.type.trim() ? body.type.trim() : "note";

    if (!title || !projectId) {
      return badRequest("Missing required fields: title, projectId");
    }

    const filename =
      typeof body.filename === "string" && body.filename.trim()
        ? body.filename.trim()
        : buildFilename(title, type);

    const document = await prisma.document.create({
      data: {
        title,
        description:
          typeof body.description === "string" ? body.description : undefined,
        filename,
        url: typeof body.url === "string" && body.url.trim() ? body.url.trim() : "#",
        type,
        size:
          typeof body.size === "number" && Number.isFinite(body.size)
            ? Math.round(body.size)
            : undefined,
        ownerId: typeof body.ownerId === "string" ? body.ownerId : undefined,
        projectId,
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

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return serverError(error, "Failed to create document.");
  }
}
