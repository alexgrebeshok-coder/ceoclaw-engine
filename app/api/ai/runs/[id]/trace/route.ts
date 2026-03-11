import { NextResponse } from "next/server";

import { getServerAIRunTrace } from "@/lib/ai/trace";
import { notFound } from "@/lib/server/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trace = await getServerAIRunTrace(id);
    return NextResponse.json(trace);
  } catch (error) {
    return notFound(
      error instanceof Error ? error.message : "Failed to load AI run trace.",
      "AI_RUN_TRACE_NOT_FOUND"
    );
  }
}
