import { ErrorBoundary } from "@/components/error-boundary";
import { TasksPage } from "@/components/tasks/tasks-page";

export default function TasksRoute() {
  return (
    <ErrorBoundary resetKey="tasks">
      <TasksPage />
    </ErrorBoundary>
  );
}
