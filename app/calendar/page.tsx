import { ErrorBoundary } from "@/components/error-boundary";
import { CalendarPage } from "@/components/calendar/calendar-page";

export default function CalendarRoute() {
  return (
    <ErrorBoundary resetKey="calendar">
      <CalendarPage />
    </ErrorBoundary>
  );
}
