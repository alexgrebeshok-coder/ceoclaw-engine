import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <div className={cn("h-1.5 rounded-full bg-[var(--panel-soft-strong)]", className)}>
      <div
        className="h-full rounded-full bg-[var(--brand)] transition-all duration-300"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}
