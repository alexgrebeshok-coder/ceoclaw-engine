"use client";

import React, { Suspense } from "react";
import { Card } from "@/components/ui/card";

interface TeamPerformanceLazyProps {
  projectId?: string;
}

// Loading fallback component
function TeamPerformanceLoading() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="h-16 animate-pulse rounded bg-[var(--surface-secondary)]" />
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <div className="h-48 animate-pulse rounded bg-[var(--surface-secondary)]" />
      </Card>
    </div>
  );
}

// Dynamic import of the heavy component
const TeamPerformance = React.lazy(() =>
  import("./team-performance").then((mod) => ({
    default: mod.TeamPerformance,
  }))
);

/**
 * Lazy-loaded TeamPerformance component with Suspense
 * Reduces initial bundle size by ~150KB (recharts)
 */
export function TeamPerformanceLazy({ projectId }: TeamPerformanceLazyProps) {
  return (
    <Suspense fallback={<TeamPerformanceLoading />}>
      <TeamPerformance projectId={projectId} />
    </Suspense>
  );
}
