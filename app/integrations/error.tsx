"use client";

import { DomainRouteError } from "@/components/layout/domain-route-error";

export default function IntegrationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <DomainRouteError domain="Connector Health" error={error} reset={reset} />;
}
