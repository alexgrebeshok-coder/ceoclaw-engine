import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getOperatorTruthBadge,
  type OperatorRuntimeTruth,
} from "@/lib/server/runtime-truth";

export function OperatorRuntimeCard({
  truth,
}: {
  truth: OperatorRuntimeTruth;
}) {
  const badge = getOperatorTruthBadge(truth);

  return (
    <Card className="min-w-0">
      <CardHeader className="min-w-0 gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>Runtime Truth</CardTitle>
            <CardDescription className="mt-2">{truth.description}</CardDescription>
          </div>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {truth.facts.map((fact) => (
          <div
            className="min-w-0 rounded-[12px] border border-[var(--line)] bg-[var(--panel-soft)] p-4"
            key={`${fact.label}:${fact.value}`}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
              {fact.label}
            </div>
            <div className="mt-2 break-words text-sm font-medium text-[var(--ink)]">
              {fact.value}
            </div>
          </div>
        ))}

        {truth.note ? (
          <div className="min-w-0 rounded-[12px] border border-dashed border-[var(--line-strong)] bg-[var(--surface-panel)] p-4 text-sm text-[var(--ink-soft)] md:col-span-2 xl:col-span-3">
            {truth.note}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
