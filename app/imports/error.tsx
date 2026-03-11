"use client";

import { DomainRouteError } from "@/components/layout/domain-route-error";

export default function ImportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <DomainRouteError domain="Imports" error={error} reset={reset} />;
}
