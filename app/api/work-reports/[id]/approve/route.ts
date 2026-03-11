import { NextRequest, NextResponse } from "next/server";

import { authorizeRequest } from "@/app/api/middleware/auth";
import { approveWorkReport } from "@/lib/work-reports/service";
import {
  badRequest,
  databaseUnavailable,
  notFound,
  serverError,
  validationError,
} from "@/lib/server/api-utils";
import { getServerRuntimeState } from "@/lib/server/runtime-mode";
import { reviewWorkReportSchema } from "@/lib/validators/work-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const authResult = authorizeRequest(request, {
      permission: "REVIEW_WORK_REPORTS",
      workspaceId: "delivery",
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const runtimeState = getServerRuntimeState();

    if (!runtimeState.databaseConfigured) {
      return databaseUnavailable(runtimeState.dataMode);
    }

    const body = await request.json();
    const parsed = reviewWorkReportSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { id } = await params;
    const report = await approveWorkReport(id, parsed.data);
    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof Error && /Reviewer not found/u.test(error.message)) {
      return badRequest(error.message, "RELATION_NOT_FOUND");
    }

    if (error instanceof Error && /Record to update not found/u.test(error.message)) {
      return notFound("Work report not found");
    }

    return serverError(error, "Failed to approve work report.");
  }
}
