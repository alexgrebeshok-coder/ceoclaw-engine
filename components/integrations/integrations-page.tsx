import Link from "next/link";

import { ConnectorHealthTable } from "@/components/integrations/connector-health-table";
import { ConnectorPolicyForm } from "@/components/integrations/connector-policy-form";
import { IntegrationsOverviewCard } from "@/components/integrations/integrations-overview-card";
import { DomainApiCard } from "@/components/layout/domain-api-card";
import { DomainPageHeader } from "@/components/layout/domain-page-header";
import { buttonVariants } from "@/components/ui/button";
import type { ConnectorStatus, ConnectorStatusSummary } from "@/lib/connectors";

const expectedEndpoints = [
  {
    method: "GET" as const,
    note: "Получить полный registry-backed список connector statuses и summary.",
    path: "/api/connectors",
  },
  {
    method: "GET" as const,
    note: "Получить статус одного connector по его id.",
    path: "/api/connectors/:connectorId",
  },
  {
    method: "GET" as const,
    note: "Проверить общую готовность runtime и агрегированный connector health.",
    path: "/api/health",
  },
];

export function IntegrationsPage({
  connectors,
  summary,
}: {
  connectors: ConnectorStatus[];
  summary: ConnectorStatusSummary;
}) {
  const liveConnectors = connectors.filter((connector) => !connector.stub).length;

  return (
    <div className="grid min-w-0 gap-6">
      <DomainPageHeader
        actions={
          <Link className={buttonVariants({ variant: "outline" })} href="/settings">
            Compare runtime settings
          </Link>
        }
        chips={[
          { label: "Registry-backed", variant: "success" },
          { label: summary.pending > 0 ? "Secrets required" : "Configured", variant: summary.pending > 0 ? "warning" : "success" },
          { label: liveConnectors > 0 ? `${liveConnectors} live probe${liveConnectors === 1 ? "" : "s"}` : "Stub adapters", variant: liveConnectors > 0 ? "success" : "info" },
        ]}
        description="Раздел интеграций подключён к реальному connector registry. Здесь видно, какие коннекторы уже дают live health probes, каких secrets не хватает и какой API surface уже подготовлен."
        eyebrow="Platform trust"
        title="Connector Health"
      />

      <IntegrationsOverviewCard summary={summary} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <ConnectorHealthTable connectors={connectors} />
        <ConnectorPolicyForm connectors={connectors} />
      </div>

      <DomainApiCard
        description="Страница уже использует реальные backend endpoints и совпадает с текущим connector framework."
        endpoints={expectedEndpoints}
        title="Backend Endpoints"
      />
    </div>
  );
}
