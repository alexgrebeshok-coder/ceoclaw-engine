import { ErrorBoundary } from "@/components/error-boundary";
import { MeetingToActionPage } from "@/components/meetings/meeting-to-action-page";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function MeetingsRoute() {
  return (
    <ErrorBoundary resetKey="meetings">
      <MeetingToActionPage />
    </ErrorBoundary>
  );
}
