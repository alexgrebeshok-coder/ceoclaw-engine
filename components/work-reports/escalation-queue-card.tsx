"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fieldStyles } from "@/components/ui/field";
import type { EscalationListResult, EscalationRecordView } from "@/lib/escalations";
import type { DerivedSyncStatus } from "@/lib/sync-state";
import type { WorkReportMemberOption } from "@/lib/work-reports/types";

function urgencyVariant(urgency: EscalationRecordView["urgency"]) {
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

function queueVariant(status: EscalationRecordView["queueStatus"]) {
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

function sourceVariant(status: EscalationRecordView["sourceStatus"]) {
  switch (status) {
    case "failed":
      return "danger";
    case "needs_approval":
      return "warning";
    case "running":
      return "info";
    case "queued":
      return "neutral";
    case "resolved":
    default:
      return "success";
  }
}

function slaVariant(status: EscalationRecordView["slaState"]) {
  switch (status) {
    case "breached":
      return "danger";
    case "due_soon":
      return "warning";
    case "resolved":
      return "success";
    case "on_track":
    default:
      return "info";
  }
}

function syncVariant(status: DerivedSyncStatus) {
  switch (status) {
    case "success":
      return "success";
    case "running":
      return "info";
    case "error":
      return "danger";
    case "idle":
    default:
      return "neutral";
  }
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "n/a";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatAge(hours: number) {
  if (hours < 1) {
    return "< 1h";
  }

  return `${hours.toFixed(hours >= 10 ? 0 : 1)}h`;
}

function formatSyncStatus(queue: EscalationListResult) {
  if (!queue.sync) {
    return "Pending";
  }

  switch (queue.sync.status) {
    case "success":
      return "Success";
    case "running":
      return "Running";
    case "error":
      return "Failed";
    case "idle":
    default:
      return "Idle";
  }
}

export function EscalationQueueCard({
  initialQueue,
  members,
}: {
  initialQueue: EscalationListResult;
  members: WorkReportMemberOption[];
}) {
  const [queue, setQueue] = useState(initialQueue);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = async () => {
    const response = await fetch("/api/escalations?limit=8", {
      cache: "no-store",
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error?.message ?? "Не удалось обновить escalation queue.");
    }

    setQueue(payload as EscalationListResult);
  };

  const refreshQueue = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch("/api/escalations/sync?limit=8", {
        method: "POST",
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Не удалось синхронизировать escalation queue.");
      }

      setQueue(payload as EscalationListResult);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Не удалось синхронизировать escalation queue."
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const updateItem = async (
    id: string,
    body: {
      ownerId?: string | null;
      queueStatus?: "open" | "acknowledged" | "resolved";
    }
  ) => {
    setSavingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/escalations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Не удалось обновить escalation item.");
      }

      await loadQueue();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Не удалось обновить escalation item."
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>Escalation queue</CardTitle>
            <CardDescription>
              Operator backlog поверх work-report signal packet. Здесь видно approval-gated и failed AI actions с owner, urgency, aging и SLA.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="warning">Open {queue.summary.open}</Badge>
            <Badge variant="info">Ack {queue.summary.acknowledged}</Badge>
            <Badge variant="danger">Breached {queue.summary.breached}</Badge>
            <Badge variant="warning">Unassigned {queue.summary.unassigned}</Badge>
            <Badge variant={syncVariant(queue.sync?.status ?? "idle")}>
              Sync {formatSyncStatus(queue)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-4">
        <div className="grid gap-3 rounded-[16px] border border-[var(--line)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--ink-soft)] md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="grid gap-1">
            <div>
              Active items: <span className="font-semibold text-[var(--ink)]">{queue.summary.total}</span>
            </div>
            <div>
              Critical/high:{" "}
              <span className="font-semibold text-[var(--ink)]">
                {queue.summary.critical + queue.summary.high}
              </span>
            </div>
            <div>
              Last sync: <span className="font-semibold text-[var(--ink)]">{formatDateTime(queue.syncedAt)}</span>
            </div>
            <div>
              Last sync result:{" "}
              <span className="font-semibold text-[var(--ink)]">
                {queue.sync?.lastResultCount !== null && queue.sync?.lastResultCount !== undefined
                  ? `${queue.sync.lastResultCount} item${queue.sync.lastResultCount === 1 ? "" : "s"}`
                  : "Unavailable"}
              </span>
            </div>
          </div>
          <div className="flex items-end justify-end">
            <Button disabled={isRefreshing} onClick={refreshQueue} size="sm" variant="outline">
              {isRefreshing ? "Syncing..." : "Sync queue"}
            </Button>
          </div>
        </div>

        {queue.sync?.lastError ? (
          <div className="rounded-[14px] border border-rose-300/70 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {queue.sync.lastError}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[14px] border border-rose-300/70 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        ) : null}

        {queue.items.length > 0 ? (
          <div className="grid gap-3">
            {queue.items.map((item) => {
              const isSaving = savingId === item.id;

              return (
                <div
                  className="rounded-[16px] border border-[var(--line)] bg-[var(--panel-soft)] p-4"
                  key={item.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-[var(--ink)]">{item.title}</div>
                      <div className="mt-1 text-xs text-[var(--ink-soft)]">
                        {item.projectName ?? "Unknown project"}
                        {item.metadata.packetLabel ? ` · ${item.metadata.packetLabel}` : ""}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={urgencyVariant(item.urgency)}>{item.urgency}</Badge>
                      <Badge variant={queueVariant(item.queueStatus)}>{item.queueStatus}</Badge>
                      <Badge variant={sourceVariant(item.sourceStatus)}>{item.sourceStatus}</Badge>
                      <Badge variant={slaVariant(item.slaState)}>{item.slaState}</Badge>
                    </div>
                  </div>

                  {item.summary ? (
                    <div className="mt-3 text-sm text-[var(--ink-soft)]">{item.summary}</div>
                  ) : null}

                  <div className="mt-3 grid gap-2 text-xs text-[var(--ink-soft)] md:grid-cols-2 xl:grid-cols-4">
                    <div>Purpose: {item.metadata.purposeLabel ?? item.purpose ?? "n/a"}</div>
                    <div>Age: {formatAge(item.ageHours)}</div>
                    <div>SLA target: {formatDateTime(item.slaTargetAt)}</div>
                    <div>Trace: {item.metadata.runId ?? item.entityRef}</div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                        Owner assignment
                      </label>
                      <select
                        className={fieldStyles}
                        disabled={isSaving}
                        onChange={(event) =>
                          void updateItem(item.id, {
                            ownerId: event.target.value || null,
                          })
                        }
                        value={item.owner?.id ?? ""}
                      >
                        <option value="">
                          Unassigned{item.recommendedOwnerRole ? ` · suggested ${item.recommendedOwnerRole}` : ""}
                        </option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name} {member.role ? `· ${member.role}` : ""}
                          </option>
                        ))}
                      </select>
                      <div className="text-xs text-[var(--ink-soft)]">
                        Current owner: {item.owner ? `${item.owner.name}${item.owner.role ? ` · ${item.owner.role}` : ""}` : "Unassigned"}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                      {item.queueStatus === "open" ? (
                        <Button
                          disabled={isSaving}
                          onClick={() => void updateItem(item.id, { queueStatus: "acknowledged" })}
                          size="sm"
                          variant="outline"
                        >
                          Acknowledge
                        </Button>
                      ) : null}
                      {item.queueStatus !== "resolved" ? (
                        <Button
                          disabled={isSaving}
                          onClick={() => void updateItem(item.id, { queueStatus: "resolved" })}
                          size="sm"
                        >
                          Resolve
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[16px] border border-dashed border-[var(--line)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--ink-soft)]">
            Активных escalation items пока нет. Создайте signal packet или дождитесь approval-gated / failed runs.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
