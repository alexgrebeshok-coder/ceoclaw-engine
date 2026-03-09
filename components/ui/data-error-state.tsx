"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DataErrorState({
  actionLabel,
  description,
  onRetry,
  title,
}: {
  actionLabel: string;
  description: string;
  onRetry: () => void;
  title: string;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-[12px] border border-[var(--line)] bg-[var(--surface-panel)] px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/12 text-rose-500">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.05em] text-[var(--ink)]">
          {title}
        </h2>
        <p className="max-w-lg text-sm leading-7 text-[var(--ink-soft)]">{description}</p>
      </div>
      <Button onClick={onRetry}>{actionLabel}</Button>
    </div>
  );
}
