import { NextRequest, NextResponse } from "next/server";

import { authorizeRequest } from "@/app/api/middleware/auth";
import { runDueTelegramBriefDeliveryPolicies } from "@/lib/briefs/telegram-delivery-policies";
import { databaseUnavailable, jsonError, serverError } from "@/lib/server/api-utils";
import { evaluatePilotWorkflowAccess } from "@/lib/server/pilot-controls";
import { getServerRuntimeState } from "@/lib/server/runtime-mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // P1-1: Fail closed for cron endpoints in production
    const cronSecret = process.env.CRON_SECRET;
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction && !cronSecret) {
      console.error("[CRON] CRON_SECRET is required in production but not configured");
      return NextResponse.json(
        {
          error: "AUTH_NOT_CONFIGURED",
          message: "CRON_SECRET environment variable is required in production",
        },
        { status: 500 }
      );
    }

    const authResult = await authorizeRequest(request, {
      apiKey: cronSecret,
      permission: "RUN_SCHEDULED_DIGESTS",
      requireApiKey: true, // Always require API key for cron endpoints
      workspaceId: "executive",
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const runtimeState = getServerRuntimeState();
    if (!runtimeState.databaseConfigured) {
      return databaseUnavailable(runtimeState.dataMode);
    }

    const pilotAccess = evaluatePilotWorkflowAccess({
      accessProfile: authResult.accessProfile,
      runtime: runtimeState,
      workflow: "scheduled_delivery",
    });
    if (!pilotAccess.allowed) {
      return jsonError(
        403,
        pilotAccess.code ?? "PILOT_STAGE_BLOCKED",
        pilotAccess.message ?? "Scheduled digest execution is blocked by pilot controls."
      );
    }

    const result = await runDueTelegramBriefDeliveryPolicies();
    return NextResponse.json(result);
  } catch (error) {
    return serverError(error, "Failed to run scheduled Telegram brief deliveries.");
  }
}
