import { NextResponse } from "next/server";
import {
  getConnectorRegistry,
  summarizeConnectorStatuses,
} from "@/lib/connectors";
import { getServerRuntimeState } from "@/lib/server/runtime-mode";

/**
 * Health check endpoint
 * Used by OpenClaw to test API connection
 */
export async function GET() {
  const runtime = getServerRuntimeState();
  const connectorStatuses = await getConnectorRegistry().getStatuses();
  const connectorSummary = summarizeConnectorStatuses(connectorStatuses);

  return NextResponse.json({
    status: runtime.healthStatus,
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    runtime: {
      dataMode: runtime.dataMode,
      databaseConfigured: runtime.databaseConfigured,
      usingMockData: runtime.usingMockData,
    },
    connectors: {
      status: connectorSummary.status,
      total: connectorSummary.total,
      configured: connectorSummary.configured,
      pending: connectorSummary.pending,
      degraded: connectorSummary.degraded,
      endpoint: "/api/connectors",
    },
  });
}
