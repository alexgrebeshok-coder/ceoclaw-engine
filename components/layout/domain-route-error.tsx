"use client";

import { useEffect } from "react";

import { ErrorFallbackCard } from "@/components/error-fallback-card";

export function DomainRouteError({
  domain,
  error,
  reset,
}: {
  domain: string;
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(`${domain} route error`, error);
  }, [domain, error]);

  return (
    <div className="grid gap-4 p-6">
      <div className="rounded-[12px] border border-[var(--line)] bg-[var(--panel-soft)] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
          {domain}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
          The shell is available, but this route hit a rendering failure. Retry keeps the page state-safe
          while backend contracts are still being connected.
        </p>
      </div>
      <ErrorFallbackCard
        error={error}
        onReload={() => window.location.reload()}
        onRetry={reset}
      />
    </div>
  );
}
