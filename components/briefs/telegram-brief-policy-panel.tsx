"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, fieldStyles } from "@/components/ui/field";

type DeliveryScope = "portfolio" | "project";
type DeliveryLocale = "ru" | "en";
type DeliveryCadence = "daily" | "weekdays";

interface ProjectOption {
  id: string;
  name: string;
}

interface PolicyRecord {
  id: string;
  scope: DeliveryScope;
  projectId: string | null;
  projectName: string | null;
  locale: DeliveryLocale;
  chatId: string | null;
  cadence: DeliveryCadence;
  timezone: string;
  deliveryHour: number;
  active: boolean;
  lastAttemptAt: string | null;
  lastDeliveredAt: string | null;
  lastMessageId: number | null;
  lastError: string | null;
}

export function TelegramBriefPolicyPanel({
  projectOptions,
}: {
  projectOptions: ProjectOption[];
}) {
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [scope, setScope] = useState<DeliveryScope>("portfolio");
  const [projectId, setProjectId] = useState(projectOptions[0]?.id ?? "");
  const [locale, setLocale] = useState<DeliveryLocale>("ru");
  const [cadence, setCadence] = useState<DeliveryCadence>("daily");
  const [timezone, setTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  });
  const [deliveryHour, setDeliveryHour] = useState("9");
  const [chatId, setChatId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingPolicyId, setTogglingPolicyId] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId && projectOptions[0]?.id) {
      setProjectId(projectOptions[0].id);
    }
  }, [projectId, projectOptions]);

  useEffect(() => {
    void loadPolicies();
  }, []);

  async function loadPolicies() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/connectors/telegram/briefs/policies", {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Failed to load Telegram delivery policies.");
      }

      setPolicies((payload.policies ?? []) as PolicyRecord[]);
      setError(null);
    } catch (loadingError) {
      setError(
        loadingError instanceof Error
          ? loadingError.message
          : "Failed to load Telegram delivery policies."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function createPolicy() {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/connectors/telegram/briefs/policies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope,
          projectId: scope === "project" ? projectId : null,
          locale,
          cadence,
          timezone: timezone.trim(),
          deliveryHour: Number(deliveryHour),
          chatId: chatId.trim() || null,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Failed to create Telegram delivery policy.");
      }

      setError(null);
      setChatId("");
      await loadPolicies();
    } catch (creationError) {
      setError(
        creationError instanceof Error
          ? creationError.message
          : "Failed to create Telegram delivery policy."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function togglePolicy(policy: PolicyRecord) {
    setTogglingPolicyId(policy.id);

    try {
      const response = await fetch(`/api/connectors/telegram/briefs/policies/${policy.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !policy.active,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error?.message ?? "Failed to update Telegram delivery policy.");
      }

      setPolicies((current) =>
        current.map((entry) => (entry.id === policy.id ? (payload as PolicyRecord) : entry))
      );
      setError(null);
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Failed to update Telegram delivery policy."
      );
    } finally {
      setTogglingPolicyId(null);
    }
  }

  const canCreatePolicy =
    !isSubmitting &&
    timezone.trim().length > 0 &&
    deliveryHour.trim().length > 0 &&
    (scope === "portfolio" || projectId.length > 0);

  return (
    <div className="mt-4 grid gap-4 rounded-[14px] border border-[var(--line)] bg-[var(--surface-panel-strong)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-[var(--ink)]">Scheduled Telegram digests</div>
          <div className="mt-1 text-xs text-[var(--ink-soft)]">
            Persist delivery policies for hourly cron execution. Current slice keeps one honest channel: Telegram only.
          </div>
        </div>
        <Badge variant="info">Cron-backed</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-[var(--ink-soft)]">
          <span>Scope</span>
          <select
            className={fieldStyles}
            onChange={(event) => setScope(event.target.value as DeliveryScope)}
            value={scope}
          >
            <option value="portfolio">Portfolio brief</option>
            <option disabled={projectOptions.length === 0} value="project">
              Project brief
            </option>
          </select>
        </label>

        {scope === "project" ? (
          <label className="grid gap-2 text-sm text-[var(--ink-soft)]">
            <span>Project</span>
            <select
              className={fieldStyles}
              onChange={(event) => setProjectId(event.target.value)}
              value={projectId}
            >
              {projectOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="grid gap-2 text-sm text-[var(--ink-soft)]">
          <span>Locale</span>
          <select
            className={fieldStyles}
            onChange={(event) => setLocale(event.target.value as DeliveryLocale)}
            value={locale}
          >
            <option value="ru">ru</option>
            <option value="en">en</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm text-[var(--ink-soft)]">
          <span>Cadence</span>
          <select
            className={fieldStyles}
            onChange={(event) => setCadence(event.target.value as DeliveryCadence)}
            value={cadence}
          >
            <option value="daily">Daily</option>
            <option value="weekdays">Weekdays only</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm text-[var(--ink-soft)]">
          <span>Timezone</span>
          <Input onChange={(event) => setTimezone(event.target.value)} value={timezone} />
        </label>

        <label className="grid gap-2 text-sm text-[var(--ink-soft)]">
          <span>Delivery hour</span>
          <Input
            max={23}
            min={0}
            onChange={(event) => setDeliveryHour(event.target.value)}
            type="number"
            value={deliveryHour}
          />
        </label>

        <label className="grid gap-2 text-sm text-[var(--ink-soft)]">
          <span>Telegram chat id</span>
          <Input
            onChange={(event) => setChatId(event.target.value)}
            placeholder="Optional if TELEGRAM_DEFAULT_CHAT_ID is configured"
            value={chatId}
          />
        </label>
      </div>

      {error ? (
        <div className="rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={!canCreatePolicy} onClick={createPolicy}>
          {isSubmitting ? "Saving policy..." : "Save delivery policy"}
        </Button>
        <div className="text-xs text-[var(--ink-soft)]">
          Trigger hourly with `POST /api/connectors/telegram/briefs/policies/run-due`.
        </div>
      </div>

      <div className="grid gap-3">
        <div className="text-sm font-medium text-[var(--ink)]">Active policy list</div>
        {isLoading ? (
          <div className="rounded-[12px] border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--ink-soft)]">
            Loading delivery policies...
          </div>
        ) : policies.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-[var(--line)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--ink-soft)]">
            No scheduled Telegram digest policies yet.
          </div>
        ) : (
          policies.map((policy) => (
            <div
              key={policy.id}
              className="grid gap-3 rounded-[14px] border border-[var(--line)] bg-[var(--panel-soft)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={policy.active ? "success" : "neutral"}>
                    {policy.active ? "Active" : "Paused"}
                  </Badge>
                  <Badge variant="info">
                    {policy.scope === "portfolio"
                      ? "Portfolio"
                      : `Project${policy.projectName ? ` · ${policy.projectName}` : ""}`}
                  </Badge>
                  <span className="text-xs text-[var(--ink-soft)]">{formatPolicySchedule(policy)}</span>
                </div>
                <Button
                  disabled={togglingPolicyId === policy.id}
                  onClick={() => togglePolicy(policy)}
                  size="sm"
                  variant="secondary"
                >
                  {togglingPolicyId === policy.id
                    ? "Updating..."
                    : policy.active
                      ? "Pause"
                      : "Resume"}
                </Button>
              </div>

              <div className="grid gap-1 text-xs text-[var(--ink-soft)]">
                <div>Target: {policy.chatId ?? "TELEGRAM_DEFAULT_CHAT_ID"}</div>
                <div>Locale: {policy.locale}</div>
                <div>Last attempt: {formatTimestamp(policy.lastAttemptAt)}</div>
                <div>Last delivered: {formatTimestamp(policy.lastDeliveredAt)}</div>
                <div>
                  Last message id: {policy.lastMessageId !== null ? policy.lastMessageId : "not sent yet"}
                </div>
              </div>

              {policy.lastError ? (
                <div className="rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  {policy.lastError}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatPolicySchedule(policy: PolicyRecord) {
  const hourLabel = `${String(policy.deliveryHour).padStart(2, "0")}:00`;
  if (policy.cadence === "weekdays") {
    return `Weekdays at ${hourLabel} ${policy.timezone}`;
  }

  return `Daily at ${hourLabel} ${policy.timezone}`;
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "not run yet";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}
