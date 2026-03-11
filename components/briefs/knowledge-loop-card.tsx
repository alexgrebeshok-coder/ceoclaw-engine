import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { KnowledgeLoopOverview, KnowledgePlaybookView } from "@/lib/knowledge";

function maturityVariant(maturity: KnowledgePlaybookView["maturity"]) {
  return maturity === "repeated" ? "success" : "info";
}

function queueVariant(status: KnowledgeLoopOverview["activeGuidance"][number]["queueStatus"]) {
  switch (status) {
    case "resolved":
      return "success";
    case "acknowledged":
      return "info";
    case "open":
    default:
      return "warning";
  }
}

function urgencyVariant(urgency: KnowledgeLoopOverview["activeGuidance"][number]["urgency"]) {
  switch (urgency) {
    case "critical":
      return "danger";
    case "high":
      return "warning";
    case "medium":
      return "info";
    case "low":
    default:
      return "neutral";
  }
}

function formatRate(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function KnowledgeLoopCard({
  overview,
  availabilityNote,
}: {
  overview: KnowledgeLoopOverview;
  availabilityNote?: string;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>Knowledge and benchmark loop</CardTitle>
            <CardDescription>
              Reusable playbooks are derived from repeated escalation patterns, then fed back into executive guidance with benchmark-backed response windows.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">Playbooks {overview.summary.totalPlaybooks}</Badge>
            <Badge variant="success">Repeated {overview.summary.repeatedPlaybooks}</Badge>
            <Badge variant="warning">Active guidance {overview.summary.benchmarkedGuidance}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-4">
        <div className="grid gap-3 rounded-[16px] border border-[var(--line)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--ink-soft)] sm:grid-cols-3">
          <div>
            <div className="font-medium text-[var(--ink)]">Tracked patterns</div>
            <div className="mt-1">{overview.summary.trackedPatterns}</div>
          </div>
          <div>
            <div className="font-medium text-[var(--ink)]">Repeated playbooks</div>
            <div className="mt-1">{overview.summary.repeatedPlaybooks}</div>
          </div>
          <div>
            <div className="font-medium text-[var(--ink)]">Benchmarked guidance</div>
            <div className="mt-1">{overview.summary.benchmarkedGuidance}</div>
          </div>
        </div>

        {availabilityNote ? (
          <div className="rounded-[16px] border border-dashed border-[var(--line)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--ink-soft)]">
            {availabilityNote}
          </div>
        ) : null}

        {overview.playbooks.length > 0 ? (
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
            <div className="grid gap-3">
              {overview.playbooks.map((playbook) => (
                <div
                  className="rounded-[16px] border border-[var(--line)] bg-[var(--panel-soft)] p-4"
                  key={playbook.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-[var(--ink)]">{playbook.title}</div>
                      <div className="mt-1 text-xs text-[var(--ink-soft)]">
                        {playbook.proposalType ?? "manual"} · {playbook.purpose ?? "general"}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={maturityVariant(playbook.maturity)}>{playbook.maturity}</Badge>
                      <Badge variant="neutral">{playbook.totalOccurrences} cases</Badge>
                      <Badge variant="info">{playbook.benchmark.ackTargetHours}h ack</Badge>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-[var(--ink-soft)]">{playbook.guidance}</div>

                  <div className="mt-3 grid gap-2 text-xs text-[var(--ink-soft)] md:grid-cols-2 xl:grid-cols-4">
                    <div>Open: {playbook.openOccurrences}</div>
                    <div>Resolved: {playbook.resolvedOccurrences}</div>
                    <div>Resolution rate: {formatRate(playbook.benchmark.resolutionRate)}</div>
                    <div>Breach rate: {formatRate(playbook.benchmark.breachRate)}</div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {playbook.lessons.map((lesson, index) => (
                      <div
                        className="rounded-[14px] border border-[var(--line)]/70 bg-[var(--surface)]/70 px-3 py-2 text-sm text-[var(--ink-soft)]"
                        key={`${playbook.id}-lesson-${index}`}
                      >
                        {lesson}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-3">
              <div className="rounded-[16px] border border-[var(--line)] bg-[var(--panel-soft)] p-4">
                <div className="font-medium text-[var(--ink)]">Active benchmark-guided guidance</div>
                <div className="mt-1 text-sm text-[var(--ink-soft)]">
                  Open escalations inherit the nearest reusable playbook so the next operator move is benchmarked instead of improvised.
                </div>
              </div>

              {overview.activeGuidance.length > 0 ? (
                overview.activeGuidance.map((item) => (
                  <div
                    className="rounded-[16px] border border-[var(--line)] bg-[var(--panel-soft)] p-4"
                    key={item.escalationId}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--ink)]">{item.title}</div>
                        <div className="mt-1 text-xs text-[var(--ink-soft)]">
                          {item.projectName ?? "Unknown project"} · {item.playbookTitle}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={urgencyVariant(item.urgency)}>{item.urgency}</Badge>
                        <Badge variant={queueVariant(item.queueStatus)}>{item.queueStatus}</Badge>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-[var(--ink-soft)]">{item.recommendedAction}</div>
                    <div className="mt-3 text-xs text-[var(--ink-soft)]">
                      Benchmark: {item.benchmarkSummary}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[16px] border border-dashed border-[var(--line)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--ink-soft)]">
                  No open escalation is currently waiting for benchmark-guided guidance.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-[16px] border border-dashed border-[var(--line)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--ink-soft)]">
            No reusable playbooks yet. This card becomes useful after repeated operator patterns accumulate in the escalation queue.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
