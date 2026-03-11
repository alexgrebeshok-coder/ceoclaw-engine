"use client";

import { DomainRouteError } from "@/components/layout/domain-route-error";

export default function BriefsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <DomainRouteError domain="Executive Briefs" error={error} reset={reset} />;
}
