import { ErrorBoundary } from "@/components/error-boundary";
import { GanttPageLazy } from "@/components/gantt/gantt-page-lazy";

export default function GanttRoute() {
  return (
    <ErrorBoundary resetKey="gantt">
      <GanttPageLazy />
    </ErrorBoundary>
  );
}
