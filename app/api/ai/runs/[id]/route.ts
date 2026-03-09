import { NextResponse } from "next/server";

import { getServerAIRun } from "@/lib/ai/server-runs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const run = await getServerAIRun(id);
    return NextResponse.json(run);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load AI run.",
      },
      { status: 404 }
    );
  }
}
