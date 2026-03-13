"use client";

import React, { Suspense } from "react";
import { Card } from "@/components/ui/card";

// Loading fallback component
function ProjectDetailLoading() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="h-32 animate-pulse rounded bg-[var(--surface-secondary)]" />
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="h-48 animate-pulse rounded bg-[var(--surface-secondary)]" />
          </Card>
        ))}
      </div>
    </div>
  );
}

// Dynamic import of the heavy component
const ProjectDetail = React.lazy(() =>
  import("./project-detail").then((mod) => ({
    default: mod.ProjectDetail,
  }))
);

/**
 * Lazy-loaded ProjectDetail component with Suspense
 * Reduces initial bundle size by ~150KB (recharts)
 */
export function ProjectDetailLazy({ projectId }: { projectId: string }) {
  return (
    <Suspense fallback={<ProjectDetailLoading />}>
      <ProjectDetail projectId={projectId} />
    </Suspense>
  );
}
