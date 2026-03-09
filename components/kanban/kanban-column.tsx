"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { KanbanAddCard } from "@/components/kanban/kanban-add-card";
import { KanbanCard } from "@/components/kanban/kanban-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/contexts/locale-context";
import type { Task, TaskStatus } from "@/lib/types";
import { cn, taskStatusMeta } from "@/lib/utils";

export function KanbanColumn({
  columnId,
  projectId,
  tasks,
  title,
}: {
  columnId: TaskStatus;
  projectId: string | null;
  tasks: Task[];
  title: string;
}) {
  const { t } = useLocale();
  const { isOver, setNodeRef } = useDroppable({
    id: `column-${columnId}`,
    data: {
      type: "column",
      columnId,
    },
  });

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "flex min-h-[520px] flex-col bg-[color:var(--surface-panel)] transition",
        isOver && "border-[var(--brand)] bg-[var(--panel-soft)]"
      )}
    >
      <CardHeader className="border-b border-[var(--line)]">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <Badge className={cn("ring-1", taskStatusMeta[columnId].className)}>
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid flex-1 content-start gap-3">
            {tasks.length ? (
              tasks.map((task) => <KanbanCard key={task.id} task={task} />)
            ) : (
              <div className="rounded-[10px] border border-dashed border-[var(--line)] bg-[var(--panel-soft)] px-4 py-8 text-center text-sm text-[var(--ink-muted)]">
                {t("kanban.emptyDescription")}
              </div>
            )}
          </div>
        </SortableContext>
        <KanbanAddCard columnId={columnId} projectId={projectId} />
      </CardContent>
    </Card>
  );
}
