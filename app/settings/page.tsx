import { ErrorBoundary } from "@/components/error-boundary";
import { SettingsPage } from "@/components/settings/settings-page";

export default function SettingsRoute() {
  return (
    <ErrorBoundary resetKey="settings">
      <SettingsPage />
    </ErrorBoundary>
  );
}
