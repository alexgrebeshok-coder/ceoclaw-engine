import { ErrorBoundary } from "@/components/error-boundary";
import { GanttPage } from "@/components/gantt/gantt-page";

export default function GanttRoute() {
  return (
    <ErrorBoundary resetKey="gantt">
      <GanttPage />
    </ErrorBoundary>
  );
}
