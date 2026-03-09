import { ErrorBoundary } from "@/components/error-boundary";
import { RisksPage } from "@/components/risks/risks-page";

export default function RisksRoute() {
  return (
    <ErrorBoundary resetKey="risks">
      <RisksPage />
    </ErrorBoundary>
  );
}
