import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EnterpriseTruthOverview, EnterpriseTruthProjectView } from "@/lib/enterprise-truth";

function projectStatusVariant(status: EnterpriseTruthProjectView["status"]) {
  switch (status) {
    case "corroborated":
      return "success";
    case "field_only":
      return "warning";
    case "finance_only":
    default:
      return "danger";
  }
}

function fieldVariant(status: EnterpriseTruthProjectView["field"]["strongestVerificationStatus"]) {
  switch (status) {
    case "verified":
      return "success";
    case "observed":
      return "info";
    case "reported":
      return "warning";
    case "none":
    default:
      return "neutral";
  }
}

function formatVariance(value: number | null) {
  if (value === null) return "n/a";
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

function formatTimestamp(value: string | null) {
  if (!value) return "n/a";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function EnterpriseTruthCard({
  overview,
}: {
  overview: EnterpriseTruthOverview;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>Enterprise truth expansion</CardTitle>
            <CardDescription>
              This layer compares 1C finance reads with field evidence and flags where enterprise truth is corroborated, one-sided, or still missing corroboration.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Corroborated {overview.summary.corroborated}</Badge>
            <Badge variant="warning">Field-only {overview.summary.fieldOnly}</Badge>
            <Badge variant="danger">Finance-only {overview.summary.financeOnly}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-4">
        <div className="grid gap-3 rounded-[16px] border border-[var(--line)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--ink-soft)] sm:grid-cols-3">
          <div>
            <div className="font-medium text-[var(--ink)]">Project truth views</div>
            <div className="mt-1">{overview.summary.totalProjects}</div>
          </div>
          <div>
            <div className="font-medium text-[var(--ink)]">Unmatched telemetry</div>
            <div className="mt-1">{overview.summary.telemetryGaps}</div>
          </div>
          <div>
            <div className="font-medium text-[var(--ink)]">Largest variance project</div>
            <div className="mt-1 truncate">{overview.summary.largestVarianceProject ?? "n/a"}</div>
          </div>
        </div>

        {overview.projects.length > 0 ? (
          <div className="grid gap-3">
            {overview.projects.map((project) => (
              <div
                className="rounded-[16px] border border-[var(--line)] bg-[var(--panel-soft)] p-4"
                key={project.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-[var(--ink)]">{project.projectName}</div>
                    <div className="mt-1 text-xs text-[var(--ink-soft)]">
                      Finance project: {project.financeProjectId ?? "n/a"}
                      {project.projectId ? ` · Internal project: ${project.projectId}` : ""}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={projectStatusVariant(project.status)}>{project.status}</Badge>
                    <Badge variant={fieldVariant(project.field.strongestVerificationStatus)}>
                      field {project.field.strongestVerificationStatus}
                    </Badge>
                    <Badge variant="info">variance {formatVariance(project.finance.variancePercent)}</Badge>
                  </div>
                </div>

                <div className="mt-3 text-sm text-[var(--ink-soft)]">{project.explanation}</div>

                <div className="mt-3 grid gap-2 text-xs text-[var(--ink-soft)] md:grid-cols-2 xl:grid-cols-4">
                  <div>Work reports: {project.field.reportCount}</div>
                  <div>Fused facts: {project.field.fusedFactCount}</div>
                  <div>Observed: {formatTimestamp(project.field.latestObservedAt)}</div>
                  <div>1C report date: {formatTimestamp(project.finance.reportDate)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[16px] border border-dashed border-[var(--line)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--ink-soft)]">
            No enterprise truth rollup yet. This view becomes useful after at least one finance sample or field evidence record is available.
          </div>
        )}

        {overview.telemetryGaps.length > 0 ? (
          <div className="grid gap-3">
            <div className="text-sm font-medium text-[var(--ink)]">Unmatched telemetry activity</div>
            {overview.telemetryGaps.map((gap) => (
              <div
                className="rounded-[16px] border border-[var(--line)] bg-[var(--surface)]/70 p-4"
                key={gap.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-[var(--ink)]">
                      {gap.equipmentId ?? "Unknown equipment"} · {gap.geofenceName ?? "Unknown geofence"}
                    </div>
                    <div className="mt-1 text-xs text-[var(--ink-soft)]">
                      Observed {formatTimestamp(gap.observedAt)}
                    </div>
                  </div>
                  <Badge variant="warning">telemetry gap</Badge>
                </div>
                <div className="mt-3 text-sm text-[var(--ink-soft)]">{gap.explanation}</div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
