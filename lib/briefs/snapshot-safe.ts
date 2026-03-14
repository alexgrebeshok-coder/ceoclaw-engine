import { loadExecutiveSnapshot, buildMockExecutiveSnapshot } from "./snapshot";
import { getServerRuntimeState } from "@/lib/server/runtime-mode";
import type { ExecutiveSnapshot } from "./types";

/**
 * Safe wrapper around loadExecutiveSnapshot with automatic fallback to mock data.
 * Used by Executive Ops pages to prevent crashes when DATABASE_URL is not configured.
 */
export async function loadExecutiveSnapshotSafe(
  filter: { projectId?: string; generatedAt?: string | Date } = {}
): Promise<{ snapshot: ExecutiveSnapshot; usingFallback: boolean; error?: string }> {
  const runtime = getServerRuntimeState();

  // If already in mock mode, use mock directly
  if (runtime.usingMockData) {
    return {
      snapshot: buildMockExecutiveSnapshot(filter),
      usingFallback: false,
    };
  }

  // Try to load live data, fallback to mock on error
  try {
    const snapshot = await loadExecutiveSnapshot(filter);
    return { snapshot, usingFallback: false };
  } catch (error) {
    console.error("[loadExecutiveSnapshotSafe] Failed to load live snapshot, using mock:", error);
    return {
      snapshot: buildMockExecutiveSnapshot(filter),
      usingFallback: true,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
