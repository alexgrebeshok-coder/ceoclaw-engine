"use client";

import { AlertTriangle, ShieldCheck, ShieldX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataErrorState } from "@/components/ui/data-error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/contexts/locale-context";
import { useRisks } from "@/lib/hooks/use-api";

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
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center gap-3 text-[var(--ink-soft)]">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{t("risks.open")}</span>
            </div>
            <p className="font-heading text-5xl font-semibold tracking-[-0.08em] text-[var(--ink)]">
              {openCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center gap-3 text-[var(--ink-soft)]">
              <ShieldX className="h-4 w-4" />
              <span className="text-sm">{t("risks.critical")}</span>
            </div>
            <p className="font-heading text-5xl font-semibold tracking-[-0.08em] text-[var(--ink)]">
              {criticalCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center gap-3 text-[var(--ink-soft)]">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm">{t("risks.mitigated")}</span>
            </div>
            <p className="font-heading text-5xl font-semibold tracking-[-0.08em] text-[var(--ink)]">
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
        <CardContent className="grid gap-4">
          {risks.map((risk) => (
            <div
              key={risk.id}
              className="grid gap-4 rounded-[8px] border border-[var(--line)] bg-[color:var(--surface-panel)] p-5 lg:grid-cols-[auto_1.2fr_.8fr_auto]"
            >
              <div
                className={
                  risk.probability >= 5 || risk.impact >= 5
                    ? "flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#ef4444] text-sm font-semibold text-white"
                    : risk.probability >= 4 || risk.impact >= 4
                      ? "flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#f59e0b] text-sm font-semibold text-white"
                      : "flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--brand)] text-sm font-semibold text-white"
                }
              >
                !
              </div>
              <div>
                <p className="font-medium text-[var(--ink)]">{risk.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--ink-muted)]">{risk.category}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{risk.mitigation}</p>
              </div>
              <div className="grid gap-2 text-sm text-[var(--ink-soft)]">
                <div>
                  {t("risks.owner")}: <span className="text-[var(--ink)]">{risk.owner}</span>
                </div>
                <div>
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
