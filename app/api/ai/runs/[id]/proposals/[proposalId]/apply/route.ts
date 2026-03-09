import { NextResponse } from "next/server";

import { applyServerAIProposal } from "@/lib/ai/server-runs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string; proposalId: string }>;
  }
) {
  try {
    const { id, proposalId } = await params;
    const run = await applyServerAIProposal({
      runId: id,
      proposalId,
    });
    return NextResponse.json(run);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to apply AI proposal.",
      },
      { status: 400 }
    );
  }
}
