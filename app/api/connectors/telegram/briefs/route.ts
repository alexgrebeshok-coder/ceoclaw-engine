import { NextRequest, NextResponse } from "next/server";

import { authorizeRequest } from "@/app/api/middleware/auth";
import { deliverBriefToTelegram } from "@/lib/briefs/telegram-delivery";
import {
  badRequest,
  jsonError,
  serverError,
  validationError,
} from "@/lib/server/api-utils";
import { telegramBriefDeliverySchema } from "@/lib/validators/telegram-brief-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authResult = authorizeRequest(request, {
    permission: "SEND_TELEGRAM_DIGESTS",
    workspaceId: "executive",
  });
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const parsed = telegramBriefDeliverySchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const result = await deliverBriefToTelegram(parsed.data);
    return NextResponse.json(result, { status: parsed.data.dryRun ? 200 : 201 });
  } catch (error) {
    if (error instanceof Error && /chat id is required/i.test(error.message)) {
      return badRequest(error.message, "TELEGRAM_CHAT_ID_REQUIRED");
    }

    if (error instanceof Error && /TELEGRAM_BOT_TOKEN/i.test(error.message)) {
      return jsonError(503, "TELEGRAM_NOT_CONFIGURED", error.message);
    }

    if (error instanceof Error && /HTTP \d+ while calling sendMessage/i.test(error.message)) {
      return jsonError(502, "TELEGRAM_DELIVERY_FAILED", error.message);
    }

    return serverError(error, "Failed to deliver brief to Telegram.", "TELEGRAM_BRIEF_DELIVERY_FAILED");
  }
}
