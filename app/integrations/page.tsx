import { ErrorBoundary } from "@/components/error-boundary";
import { IntegrationsPage } from "@/components/integrations/integrations-page";
import {
  getConnectorRegistry,
  summarizeConnectorStatuses,
} from "@/lib/connectors";
import { getGpsTelemetrySampleSnapshot } from "@/lib/connectors/gps-client";
import { getEvidenceLedgerOverview } from "@/lib/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function IntegrationsRoute() {
  const [connectors, gpsSample] = await Promise.all([
    getConnectorRegistry().getStatuses(),
    getGpsTelemetrySampleSnapshot(),
  ]);
  const summary = summarizeConnectorStatuses(connectors);
  const evidence = await getEvidenceLedgerOverview({ limit: 6 }, { gpsSnapshot: gpsSample });

  return (
    <ErrorBoundary resetKey="integrations">
      <IntegrationsPage
        connectors={connectors}
        evidence={evidence}
        gpsSample={gpsSample}
        summary={summary}
      />
    </ErrorBoundary>
  );
}
