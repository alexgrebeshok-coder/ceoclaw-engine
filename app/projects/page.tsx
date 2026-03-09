import { ErrorBoundary } from "@/components/error-boundary";
import { ProjectsPage } from "@/components/projects/projects-page";

export default async function ProjectsRoute({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <ErrorBoundary resetKey={resolvedSearchParams?.query ?? "projects"}>
      <ProjectsPage initialQuery={resolvedSearchParams?.query ?? ""} />
    </ErrorBoundary>
  );
}
