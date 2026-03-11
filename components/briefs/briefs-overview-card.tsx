import { DomainMetricCard } from "@/components/layout/domain-metric-card";
import type { PortfolioBrief } from "@/lib/briefs/types";

export function BriefsOverviewCard({
  portfolioBrief,
}: {
  portfolioBrief: PortfolioBrief;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <DomainMetricCard
        detail="Активные проекты, попавшие в текущий executive operating contour."
        label="Active projects"
        status={{ label: "Live", variant: "success" }}
        value={String(portfolioBrief.portfolio.activeProjects)}
      />
      <DomainMetricCard
        detail="Проекты, которые уже дают критические сигналы и требуют управленческого внимания."
        label="Critical alerts"
        status={{
          label:
            portfolioBrief.portfolio.criticalProjects > 0 ? "Escalate" : "Stable",
          variant:
            portfolioBrief.portfolio.criticalProjects > 0 ? "warning" : "success",
        }}
        value={String(portfolioBrief.portfolio.criticalProjects)}
      />
      <DomainMetricCard
        detail="Рекомендованные действия, которые brief уже собрал для руководства без внешнего AI."
        label="Recommended actions"
        status={{ label: "Ready", variant: "info" }}
        value={String(portfolioBrief.recommendationsSummary.length)}
      />
    </div>
  );
}
