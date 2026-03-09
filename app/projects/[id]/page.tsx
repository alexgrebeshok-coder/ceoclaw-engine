import { ErrorBoundary } from "@/components/error-boundary";
import { ProjectDetail } from "@/components/projects/project-detail";

export default async function ProjectDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ErrorBoundary resetKey={id}>
      <ProjectDetail projectId={id} />
    </ErrorBoundary>
  );
}
