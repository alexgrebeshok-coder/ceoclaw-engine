import {
  KpiCardSkeleton,
  ProjectCardSkeleton,
  TaskTableSkeleton,
} from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <KpiCardSkeleton key={index} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
        <TaskTableSkeleton />
      </div>
    </div>
  );
}
