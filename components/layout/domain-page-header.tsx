import { type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DomainHeaderChip {
  label: string;
  variant?: "danger" | "info" | "neutral" | "success" | "warning";
}

export function DomainPageHeader({
  actions,
  chips = [],
  description,
  eyebrow,
  title,
}: {
  actions?: ReactNode;
  chips?: DomainHeaderChip[];
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <Card className="min-w-0 overflow-hidden bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface-panel)_88%,var(--brand)_12%)_0%,var(--surface-panel)_58%,color-mix(in_srgb,var(--panel-soft)_92%,white_8%)_100%)]">
      <CardHeader className="min-w-0 gap-4 border-b border-[var(--line)] md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
            {eyebrow}
          </p>
          <div className="min-w-0 space-y-3">
            <CardTitle className="break-words text-3xl tracking-[-0.06em] sm:text-4xl">{title}</CardTitle>
            <p className="max-w-2xl break-words text-sm leading-7 text-[var(--ink-soft)]">{description}</p>
          </div>
        </div>

        {actions ? <div className="min-w-0 flex flex-wrap gap-3">{actions}</div> : null}
      </CardHeader>

      {chips.length ? (
        <CardContent className="min-w-0 flex flex-wrap gap-2 pt-4">
          {chips.map((chip) => (
            <Badge key={chip.label} variant={chip.variant ?? "neutral"}>
              {chip.label}
            </Badge>
          ))}
        </CardContent>
      ) : null}
    </Card>
  );
}
