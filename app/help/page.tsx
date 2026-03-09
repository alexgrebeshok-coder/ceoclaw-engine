import { ErrorBoundary } from "@/components/error-boundary";
import { HelpPage } from "@/components/help/help-page";

export default function HelpRoute() {
  return (
    <ErrorBoundary resetKey="help">
      <HelpPage />
    </ErrorBoundary>
  );
}
