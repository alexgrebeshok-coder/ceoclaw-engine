"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { KanbanBoard } from "@/components/kanban/kanban-board";
import { DataErrorState } from "@/components/ui/data-error-state";
import { useLocale } from "@/contexts/locale-context";
import { api } from "@/lib/client/api-error";
import { useProjects } from "@/lib/hooks/use-api";
import type { Board } from "@/lib/types";

function isBoard(input: unknown): input is Board {
  return Boolean(
    input &&
      typeof input === "object" &&
      "id" in input &&
      typeof (input as Board).id === "string" &&
      "columns" in input &&
      Array.isArray((input as Board).columns)
  );
}

function isBoardCollection(input: unknown): input is Board[] {
  return Array.isArray(input) && input.every(isBoard);
}

export function KanbanPage() {
  const { t } = useLocale();
  const { error: projectsError, isLoading: projectsLoading, projects } = useProjects();
  const [boardId, setBoardId] = useState<string | null>(null);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const resolveBoard = useCallback(async () => {
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    setIsLoadingBoard(true);
    setLoadError(null);

    try {
      const boardsPayload = await api.get<unknown>("/api/boards");
      const boards = isBoardCollection(boardsPayload) ? boardsPayload : [];

      if (boards[0]?.id) {
        setBoardId(boards[0].id);
        return;
      }

      const firstProject = projects[0];
      if (!firstProject) {
        setBoardId(null);
        return;
      }

      const createdBoardPayload = await api.post<unknown>("/api/boards", {
        name: "Основная доска",
        projectId: firstProject.id,
      });

      if (!isBoard(createdBoardPayload)) {
        throw new Error(t("error.loadDescription"));
      }

      setBoardId(createdBoardPayload.id);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t("error.loadDescription");
      setBoardId(null);
      setLoadError(message);
    } finally {
      inFlightRef.current = false;
      setIsLoadingBoard(false);
    }
  }, [projects, t]);

  useEffect(() => {
    if (projectsLoading) return;
    void resolveBoard();
  }, [projectsLoading, resolveBoard]);

  if (projectsLoading || isLoadingBoard) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[var(--ink-muted)]">{t("loading.label")}</p>
      </div>
    );
  }

  if (loadError || (projectsError && !boardId)) {
    return (
      <DataErrorState
        actionLabel={t("action.retry")}
        description={loadError ?? t("error.loadDescription")}
        onRetry={() => {
          void resolveBoard();
        }}
        title={t("error.loadTitle")}
      />
    );
  }

  if (!projects.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-semibold">{t("kanban.noProject")}</h1>
          <p className="text-[var(--ink-muted)]">
            {t("kanban.emptyDescription")}
          </p>
        </div>
      </div>
    );
  }

  if (!boardId) {
    return (
      <DataErrorState
        actionLabel={t("action.retry")}
        description={t("error.loadDescription")}
        onRetry={() => {
          void resolveBoard();
        }}
        title={t("error.loadTitle")}
      />
    );
  }

  return <KanbanBoard boardId={boardId} />;
}
