import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GpsTelemetrySampleSnapshot } from "@/lib/connectors/gps-client";

function statusVariant(status: GpsTelemetrySampleSnapshot["status"]) {
  switch (status) {
    case "ok":
      return "success";
    case "degraded":
      return "danger";
    case "pending":
    default:
      return "warning";
  }
}

function formatDuration(durationSeconds: number | null) {
  if (durationSeconds === null) {
    return "Duration unavailable";
  }

  const minutes = Math.round(durationSeconds / 60);
  return `${minutes} min`;
}

function formatRange(startedAt: string | null, endedAt: string | null) {
  if (!startedAt && !endedAt) {
    return "Time range unavailable";
  }

  return [startedAt ?? "?", endedAt ?? "?"].join(" -> ");
}

export function GpsTelemetrySampleCard({
  snapshot,
}: {
  snapshot: GpsTelemetrySampleSnapshot;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>GPS telemetry sample</CardTitle>
            <CardDescription>
              Первый read-only evidence slice поверх live GPS API. Здесь видно не только health, но и реальные session-like records.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={statusVariant(snapshot.status)}>{snapshot.status}</Badge>
            <Badge variant={snapshot.configured ? "success" : "warning"}>
              {snapshot.configured ? "Configured" : "Secrets missing"}
            </Badge>
            <Badge variant={snapshot.samples.length > 0 ? "info" : "warning"}>
              {snapshot.samples.length} sample{snapshot.samples.length === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-4">
        <div className="rounded-[16px] border border-[var(--line)] bg-[var(--panel-soft)] p-4 text-sm">
          <div className="font-medium text-[var(--ink)]">Connector message</div>
          <div className="mt-1 text-[var(--ink-soft)]">{snapshot.message}</div>
          {snapshot.sampleUrl ? (
            <div className="mt-3">
              <div className="font-medium text-[var(--ink)]">Sample endpoint</div>
              <code className="mt-1 block break-all text-xs text-[var(--ink-soft)]">
                {snapshot.sampleUrl}
              </code>
            </div>
          ) : null}
          {snapshot.missingSecrets.length > 0 ? (
            <div className="mt-3 text-xs text-[var(--ink-soft)]">
              Missing secrets: {snapshot.missingSecrets.join(", ")}
            </div>
          ) : null}
        </div>

        {snapshot.samples.length > 0 ? (
          <div className="grid gap-3">
            {snapshot.samples.map((sample, index) => (
              <div
                className="rounded-[16px] border border-[var(--line)] bg-[var(--panel-soft)] p-4"
                key={sample.sessionId ?? `${sample.equipmentId ?? "equipment"}:${index}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-[var(--ink)]">
                      {sample.equipmentId ?? "Unknown equipment"}
                    </div>
                    <div className="mt-1 text-xs text-[var(--ink-soft)]">
                      {sample.equipmentType ?? "Equipment type unavailable"}
                    </div>
                  </div>
                  <Badge variant="info">{sample.status}</Badge>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-[var(--ink-soft)]">
                  <div>Session: {sample.sessionId ?? "Unavailable"}</div>
                  <div>Range: {formatRange(sample.startedAt, sample.endedAt)}</div>
                  <div>Duration: {formatDuration(sample.durationSeconds)}</div>
                  <div>
                    Geofence: {sample.geofenceName ?? sample.geofenceId ?? "Unavailable"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
