import { ErrorBoundary } from "@/components/error-boundary";
import { BriefsPage } from "@/components/briefs/briefs-page";
import {
  generatePortfolioBriefFromSnapshot,
  generateProjectBriefFromSnapshot,
} from "@/lib/briefs/generate";
import { loadExecutiveSnapshot } from "@/lib/briefs/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function BriefsRoute() {
  const snapshot = await loadExecutiveSnapshot();
  const portfolioBrief = generatePortfolioBriefFromSnapshot(snapshot, { locale: "ru" });

  const projectIds = Array.from(
    new Set(
      portfolioBrief.topAlerts
        .map((alert) => alert.projectId)
        .filter((value): value is string => Boolean(value))
    )
  ).slice(0, 2);

  const fallbackProjectId =
    projectIds[0] ?? snapshot.projects.find((project) => project.status !== "completed")?.id;

  const finalProjectIds =
    projectIds.length > 0
      ? projectIds
      : fallbackProjectId
        ? [fallbackProjectId]
        : [];

  const projectBriefs = finalProjectIds.map((projectId) =>
    generateProjectBriefFromSnapshot(snapshot, projectId, { locale: "ru" })
  );
  const projectOptions = snapshot.projects
    .filter((project) => project.status !== "completed")
    .map((project) => ({
      id: project.id,
      name: project.name,
    }));

  return (
    <ErrorBoundary resetKey="briefs">
      <BriefsPage
        portfolioBrief={portfolioBrief}
        projectBriefs={projectBriefs}
        projectOptions={projectOptions}
      />
    </ErrorBoundary>
  );
}
