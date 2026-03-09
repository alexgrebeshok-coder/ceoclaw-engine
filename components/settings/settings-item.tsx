import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SettingsItem({
  label,
  description,
  children,
  className,
}: {
  label: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[24px] border border-[var(--line)] bg-[var(--panel-soft)]/65 p-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="max-w-xl space-y-1">
        <p className="text-sm font-semibold text-[var(--ink)]">{label}</p>
        <p className="text-sm text-[var(--ink-muted)]">{description}</p>
      </div>
      <div className="sm:min-w-[220px] sm:max-w-[320px]">{children}</div>
    </div>
  );
}
