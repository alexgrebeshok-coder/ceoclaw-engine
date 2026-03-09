import { NextRequest, NextResponse } from "next/server";

import { createServerAIRun } from "@/lib/ai/server-runs";
import type { AIRunInput } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as AIRunInput;
    const run = await createServerAIRun(input);
    return NextResponse.json(run);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create AI run.",
      },
      { status: 500 }
    );
  }
}
