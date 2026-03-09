import { ErrorBoundary } from "@/components/error-boundary";
import { TeamPage } from "@/components/team/team-page";

export default function TeamRoute() {
  return (
    <ErrorBoundary resetKey="team">
      <TeamPage />
    </ErrorBoundary>
  );
}
