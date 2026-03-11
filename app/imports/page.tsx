import { ErrorBoundary } from "@/components/error-boundary";
import { ImportsPage } from "@/components/imports/imports-page";

export default function ImportsRoute() {
  return (
    <ErrorBoundary resetKey="imports">
      <ImportsPage />
    </ErrorBoundary>
  );
}
