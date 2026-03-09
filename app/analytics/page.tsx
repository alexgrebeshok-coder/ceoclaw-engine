import { ErrorBoundary } from "@/components/error-boundary";
import { AnalyticsPage } from "@/components/analytics/analytics-page";

export default function AnalyticsRoute() {
  return (
    <ErrorBoundary resetKey="analytics">
      <AnalyticsPage />
    </ErrorBoundary>
  );
}
