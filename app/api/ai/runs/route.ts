import { type NextRequest, NextResponse } from "next/server";

import { createServerAIRun, listServerAIRunEntries } from "@/lib/ai/server-runs";
import type { AIRunInput } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AIRunInput;
    const { agent, prompt, context, quickAction, sessionId } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!agent || !agent.id) {
      return NextResponse.json({ error: "Agent is required" }, { status: 400 });
    }

    // Use the existing server AI run system
    const run = await createServerAIRun({
      agent,
      prompt: prompt.trim(),
      context,
      quickAction,
      sessionId,
    });

    return NextResponse.json(run);
  } catch (error) {
    console.error("[AI Runs API] POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const entries = await listServerAIRunEntries();
    return NextResponse.json({
      runs: entries.map((entry) => entry.run),
      count: entries.length,
    });
  } catch (error) {
    console.error("[AI Runs API] GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
