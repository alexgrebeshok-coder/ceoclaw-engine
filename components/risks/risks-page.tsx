"use client";

import { AlertTriangle, ShieldCheck, ShieldX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataErrorState } from "@/components/ui/data-error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/contexts/locale-context";
import { useRisks } from "@/lib/hooks/use-api";

function summaryCardClass(tone: "danger" | "neutral" | "success") {
  switch (tone) {
    case "danger":
      return "border-rose-500/20 bg-rose-500/5 dark:border-rose-400/25 dark:bg-rose-500/10";
    case "success":
      return "border-emerald-500/20 bg-emerald-500/5 dark:border-emerald-400/25 dark:bg-emerald-500/10";
    case "neutral":
    default:
      return "border-amber-500/20 bg-amber-500/5 dark:border-amber-400/25 dark:bg-amber-500/10";
  }
}

function summaryIconClass(tone: "danger" | "neutral" | "success") {
  switch (tone) {
    case "danger":
      return "bg-rose-500/14 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300";
    case "success":
      return "bg-emerald-500/14 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300";
    case "neutral":
    default:
      return "bg-amber-500/14 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300";
  }
}

function summaryValueClass(tone: "danger" | "neutral" | "success") {
  switch (tone) {
    case "danger":
      return "text-rose-600 dark:text-rose-300";
    case "success":
      return "text-emerald-600 dark:text-emerald-300";
    case "neutral":
    default:
      return "text-amber-600 dark:text-amber-300";
  }
}

function riskIconClass(probability: number, impact: number) {
  if (probability >= 5 || impact >= 5) {
    return "flex h-11 w-11 items-center justify-center rounded-[10px] border border-rose-500/30 bg-rose-500/12 text-sm font-semibold text-rose-200";
  }

  if (probability >= 4 || impact >= 4) {
    return "flex h-11 w-11 items-center justify-center rounded-[10px] border border-amber-500/30 bg-amber-500/12 text-sm font-semibold text-amber-200";
  }

  return "flex h-11 w-11 items-center justify-center rounded-[10px] border border-sky-500/30 bg-sky-500/12 text-sm font-semibold text-sky-200";
}

function RisksSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48" />
        </CardHeader>
        <CardContent className="grid gap-4">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function RisksPage() {
  const { enumLabel, t } = useLocale();
  const { error, isLoading, mutate, risks } = useRisks();

  if (isLoading && risks.length === 0) {
    return <RisksSkeleton />;
  }

  if (error && risks.length === 0) {
    return (
      <DataErrorState
        actionLabel={t("action.retry")}
        description={t("error.loadDescription")}
        onRetry={() => {
          void mutate();
        }}
        title={t("error.loadTitle")}
      />
    );
  }

  const openCount = risks.filter((risk) => risk.status === "open").length;
  const criticalCount = risks.filter((risk) => risk.probability >= 5 || risk.impact >= 5).length;
  const mitigatedCount = risks.filter((risk) => risk.status === "mitigated").length;

  return (
    <div className="grid min-w-0 gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={summaryCardClass("neutral")}>
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center gap-3 text-[var(--ink-soft)]">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${summaryIconClass("neutral")}`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <span className="text-sm">{t("risks.open")}</span>
            </div>
            <p className={`font-heading text-5xl font-semibold tracking-[-0.08em] ${summaryValueClass("neutral")}`}>
              {openCount}
            </p>
          </CardContent>
        </Card>
        <Card className={summaryCardClass("danger")}>
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center gap-3 text-[var(--ink-soft)]">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${summaryIconClass("danger")}`}>
                <ShieldX className="h-4 w-4" />
              </div>
              <span className="text-sm">{t("risks.critical")}</span>
            </div>
            <p className={`font-heading text-5xl font-semibold tracking-[-0.08em] ${summaryValueClass("danger")}`}>
              {criticalCount}
            </p>
          </CardContent>
        </Card>
        <Card className={summaryCardClass("success")}>
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center gap-3 text-[var(--ink-soft)]">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${summaryIconClass("success")}`}>
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-sm">{t("risks.mitigated")}</span>
            </div>
            <p className={`font-heading text-5xl font-semibold tracking-[-0.08em] ${summaryValueClass("success")}`}>
              {mitigatedCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("risks.title")}</CardTitle>
          <p className="text-sm leading-7 text-[var(--ink-soft)]">{t("risks.description")}</p>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-4">
          {risks.map((risk) => (
            <div
              key={risk.id}
              className="grid min-w-0 gap-4 rounded-[12px] border border-[var(--line)] bg-[color:var(--surface-panel)] p-5 lg:grid-cols-[auto_minmax(0,1.2fr)_minmax(220px,.8fr)_auto]"
            >
              <div className={riskIconClass(risk.probability, risk.impact)}>
                !
              </div>
              <div className="min-w-0">
                <p className="break-words font-medium text-[var(--ink)]">{risk.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--ink-muted)]">{risk.category}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{risk.mitigation}</p>
              </div>
              <div className="grid gap-3 text-sm text-[var(--ink-soft)] sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[10px] border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2.5">
                  {t("risks.owner")}: <span className="text-[var(--ink)]">{risk.owner}</span>
                </div>
                <div className="rounded-[10px] border border-[var(--line)] bg-[var(--panel-soft)] px-3 py-2.5">
                  {t("risks.score")}:{" "}
                  <span className="text-[var(--ink)]">
                    {risk.probability} x {risk.impact}
                  </span>
                </div>
              </div>
              <div className="flex items-start justify-end">
                <Badge variant={risk.status === "open" ? "danger" : risk.status === "mitigated" ? "warning" : "success"}>
                  {enumLabel("riskStatus", risk.status)}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
