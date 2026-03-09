import { ErrorBoundary } from "@/components/error-boundary";
import { DashboardHome } from "@/components/dashboard/dashboard-home";

export default function HomePage() {
  return (
    <ErrorBoundary resetKey="dashboard">
      <DashboardHome />
    </ErrorBoundary>
  );
}
