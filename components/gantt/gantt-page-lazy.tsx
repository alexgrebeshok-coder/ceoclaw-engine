"use client";

import React, { Suspense } from "react";
import { Card } from "@/components/ui/card";

// Loading fallback component
function GanttPageLoading() {
  return (
    <div className="grid gap-4">
      <Card className="p-6">
        <div className="h-32 animate-pulse rounded bg-[var(--surface-secondary)]" />
      </Card>
      <Card className="p-6">
        <div className="h-96 animate-pulse rounded bg-[var(--surface-secondary)]" />
      </Card>
    </div>
  );
}

// Dynamic import of the heavy component
const GanttPage = React.lazy(() =>
  import("./gantt-page").then((mod) => ({
    default: mod.GanttPage,
  }))
);

/**
 * Lazy-loaded GanttPage component with Suspense
 * Reduces initial bundle size by ~50KB (date-fns heavy usage)
 */
export function GanttPageLazy() {
  return (
    <Suspense fallback={<GanttPageLoading />}>
      <GanttPage />
    </Suspense>
  );
}
