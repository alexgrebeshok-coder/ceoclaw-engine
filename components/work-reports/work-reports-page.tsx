import Link from "next/link";

import { DomainApiCard } from "@/components/layout/domain-api-card";
import { DomainPageHeader } from "@/components/layout/domain-page-header";
import { buttonVariants } from "@/components/ui/button";
import { ReportBuilderForm } from "@/components/work-reports/report-builder-form";
import { ReportRunsTable } from "@/components/work-reports/report-runs-table";
import { WorkReportActionPilot } from "@/components/work-reports/work-report-action-pilot";
import { WorkReportsOverviewCard } from "@/components/work-reports/work-reports-overview-card";
import type {
  WorkReportMemberOption,
  WorkReportProjectOption,
  WorkReportView,
} from "@/lib/work-reports/types";

const expectedEndpoints = [
  {
    method: "GET" as const,
    note: "Получить project-scoped список полевых отчётов с review-статусом и metadata.",
    path: "/api/work-reports",
  },
  {
    method: "POST" as const,
    note: "Создать новый полевой отчёт через manual intake или mapped legacy payload.",
    path: "/api/work-reports",
  },
  {
    method: "POST" as const,
    note: "Подтвердить отчёт и зафиксировать reviewer/comment.",
    path: "/api/work-reports/:reportId/approve",
  },
  {
    method: "POST" as const,
    note: "Отклонить отчёт с обязательным review comment.",
    path: "/api/work-reports/:reportId/reject",
  },
  {
    method: "POST" as const,
    note: "Собрать signal packet из полевого отчёта и запустить runs для tasks, risks и status.",
    path: "/api/work-reports/:reportId/signal-packet",
  },
  {
    method: "GET" as const,
    note: "Посмотреть provenance/trace summary для конкретного AI run из signal packet.",
    path: "/api/ai/runs/:runId/trace",
  },
];

export function WorkReportsPage({
  databaseReady,
  members,
  projects,
  reports,
}: {
  databaseReady: boolean;
  members: WorkReportMemberOption[];
  projects: WorkReportProjectOption[];
  reports: WorkReportView[];
}) {
  const pendingReports = reports.filter((report) => report.status === "submitted").length;
  const approvedReports = reports.filter((report) => report.status === "approved").length;
  const telegramBotReports = reports.filter((report) => report.source === "telegram_bot").length;

  return (
    <div className="grid min-w-0 gap-6">
      <DomainPageHeader
        actions={
          <Link className={buttonVariants({ variant: "outline" })} href="/projects">
            Открыть портфель проектов
          </Link>
        }
        chips={[
          { label: databaseReady ? "Live DB" : "DB required", variant: databaseReady ? "success" : "warning" },
          { label: "Submit/review flow", variant: "info" },
          { label: "Telegram-ready", variant: "success" },
        ]}
        description="Раздел уже подключён к живому work-reports backend: можно создавать отчёты, видеть проектную ленту и работать по циклу submitted/approved/rejected."
        eyebrow="Delivery cadence"
        title="Work Reports"
      />

      <WorkReportsOverviewCard
        approvedReports={approvedReports}
        pendingReports={pendingReports}
        telegramBotReports={telegramBotReports}
        totalReports={reports.length}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <ReportRunsTable reports={reports} />
        <ReportBuilderForm members={members} projects={projects} />
      </div>

      <WorkReportActionPilot reports={reports} />

      <DomainApiCard
        description="UI уже привязана к реальным backend-контрактам для create/list/review и теперь умеет собирать action packet из полевого отчёта."
        endpoints={expectedEndpoints}
        title="Backend Endpoints"
      />
    </div>
  );
}
