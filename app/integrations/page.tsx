import { ErrorBoundary } from "@/components/error-boundary";
import { IntegrationsPage } from "@/components/integrations/integrations-page";
import {
  getConnectorRegistry,
  summarizeConnectorStatuses,
} from "@/lib/connectors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function IntegrationsRoute() {
  const connectors = await getConnectorRegistry().getStatuses();
  const summary = summarizeConnectorStatuses(connectors);

  return (
    <ErrorBoundary resetKey="integrations">
      <IntegrationsPage connectors={connectors} summary={summary} />
    </ErrorBoundary>
  );
}
