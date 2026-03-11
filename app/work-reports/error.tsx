"use client";

import { DomainRouteError } from "@/components/layout/domain-route-error";

export default function WorkReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <DomainRouteError domain="Work Reports" error={error} reset={reset} />;
}
