import { DomainMetricCard } from "@/components/layout/domain-metric-card";

export function WorkReportsOverviewCard({
  approvedReports,
  pendingReports,
  telegramBotReports,
  totalReports,
}: {
  approvedReports: number;
  pendingReports: number;
  telegramBotReports: number;
  totalReports: number;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <DomainMetricCard
        detail="Количество полевых отчётов, уже попавших в единый operational contour по проектам."
        label="Всего отчётов"
        status={{ label: "Live", variant: "success" }}
        value={String(totalReports)}
      />
      <DomainMetricCard
        detail="Очередь отчётов, которые ещё ждут review и управленческого подтверждения."
        label="Ожидают review"
        status={{
          label: pendingReports > 0 ? "Attention" : "Clear",
          variant: pendingReports > 0 ? "warning" : "success",
        }}
        value={String(pendingReports)}
      />
      <DomainMetricCard
        detail="Отчёты, пришедшие через legacy AI-PMO Telegram intake и уже совместимые с новым доменом."
        label="Telegram intake"
        status={{ label: approvedReports > 0 ? "In use" : "Ready", variant: "info" }}
        value={String(telegramBotReports)}
      />
    </div>
  );
}
