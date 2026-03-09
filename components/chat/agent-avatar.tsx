"use client";

import { cn } from "@/lib/utils";

export function AgentAvatar({
  icon,
  label,
  tone = "assistant",
}: {
  icon: string;
  label: string;
  tone?: "user" | "assistant";
}) {
  return (
    <div
      aria-label={label}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border text-base",
        tone === "user"
          ? "border-[var(--brand)] bg-[var(--brand)] text-white"
          : "border-[var(--line)] bg-[color:var(--surface-panel-strong)] text-[var(--ink)]"
      )}
    >
      <span aria-hidden>{icon}</span>
    </div>
  );
}
