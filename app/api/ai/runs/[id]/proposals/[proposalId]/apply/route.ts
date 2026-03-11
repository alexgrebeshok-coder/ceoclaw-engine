import { NextResponse } from "next/server";

import { applyServerAIProposal } from "@/lib/ai/server-runs";
import { syncEscalationQueue } from "@/lib/escalations";
import { badRequest } from "@/lib/server/api-utils";

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
    void syncEscalationQueue().catch((error) => {
      console.error("Failed to sync escalation queue after AI proposal apply.", error);
    });
    return NextResponse.json(run);
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Failed to apply AI action.",
      "AI_PROPOSAL_APPLY_FAILED"
    );
  }
}
