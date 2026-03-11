import { DomainMetricCard } from "@/components/layout/domain-metric-card";
import type { ConnectorStatusSummary } from "@/lib/connectors";

export function IntegrationsOverviewCard({
  summary,
}: {
  summary: ConnectorStatusSummary;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <DomainMetricCard
        detail="Количество коннекторов, зарегистрированных в общем registry и доступных через health/status API."
        label="Connector registry"
        status={{ label: summary.status.toUpperCase(), variant: summary.status === "ok" ? "success" : summary.status === "pending" ? "warning" : "danger" }}
        value={String(summary.total)}
      />
      <DomainMetricCard
        detail="Коннекторы, у которых уже заданы обязательные env secrets и которые готовы к глубокой реализации."
        label="Configured"
        status={{ label: summary.configured === summary.total ? "Ready" : "Partial", variant: summary.configured === summary.total ? "success" : "info" }}
        value={String(summary.configured)}
      />
      <DomainMetricCard
        detail="Слоты, где ещё не хватает credentials или сервисных параметров для реального подключения."
        label="Pending setup"
        status={{ label: summary.pending > 0 ? "Needs secrets" : "Clear", variant: summary.pending > 0 ? "warning" : "success" }}
        value={String(summary.pending)}
      />
    </div>
  );
}
