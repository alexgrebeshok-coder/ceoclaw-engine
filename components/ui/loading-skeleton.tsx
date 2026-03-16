"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded bg-[var(--line)]",
        animate && "animate-pulse",
        className
      )}
    />
  );
}

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export function SkeletonCard({ className, lines = 3 }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--line)] bg-[var(--surface-panel)] p-4",
        className
      )}
    >
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              "h-4",
              i === 0 ? "w-3/4" : i === lines - 1 ? "w-1/2" : "w-full"
            )}
          />
        ))}
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: SkeletonTableProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex gap-4 border-b border-[var(--line)] pb-2">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn(
                "h-4 flex-1",
                colIndex === 0 && "w-1/4"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface SkeletonListProps {
  items?: number;
  className?: string;
}

export function SkeletonList({ items = 5, className }: SkeletonListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-md border border-[var(--line)] bg-[var(--surface-panel)] p-3"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* KPI Cards */}
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
      {/* Charts */}
      <div className="col-span-2">
        <SkeletonCard lines={5} className="h-[300px]" />
      </div>
      <div className="col-span-2">
        <SkeletonCard lines={5} className="h-[300px]" />
      </div>
      {/* List */}
      <div className="col-span-full">
        <SkeletonList items={4} />
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-panel)] p-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-1 h-4 w-3/4" />
      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-2 w-32" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-[var(--line)]">
      <td className="p-3">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="p-3">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="p-3">
        <Skeleton className="h-6 w-16 rounded-full" />
      </td>
      <td className="p-3">
        <Skeleton className="h-8 w-8 rounded" />
      </td>
    </tr>
  );
}
