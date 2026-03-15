"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TeamMemberCardProps {
  member: TeamMember;
}

function getCapacityColor(allocated: number): string {
  if (allocated >= 90) return "bg-red-500";
  if (allocated >= 70) return "bg-amber-500";
  return "bg-green-500";
}

function getCapacityTextColor(allocated: number): string {
  if (allocated >= 90) return "text-red-600 dark:text-red-300";
  if (allocated >= 70) return "text-amber-600 dark:text-amber-300";
  return "text-green-600 dark:text-green-300";
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const capacityColor = getCapacityColor(member.allocated);
  const capacityTextColor = getCapacityTextColor(member.allocated);

  return (
    <Card className="p-3 bg-[var(--panel-soft)]/40 hover:bg-[var(--panel-soft)]/60 transition-colors">
      {/* Header with avatar and name */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-[10px] font-semibold text-white flex-shrink-0">
          {member.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate">{member.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{member.role}</p>
        </div>
        <Badge
          variant={
            member.allocated >= 90
              ? "danger"
              : member.allocated >= 70
                ? "warning"
                : "success"
          }
          className="text-[10px] px-1.5 py-0.5"
        >
          {member.allocated}%
        </Badge>
      </div>

      {/* Capacity bar */}
      <div className="mb-2">
        <div className="h-1.5 rounded-full bg-[var(--panel-soft-strong)] overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-300", capacityColor)}
            style={{ width: `${Math.min(member.allocated, 100)}%` }}
          />
        </div>
      </div>

      {/* Projects count */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{member.projects.length} projects</span>
        <span className={cn("font-medium", capacityTextColor)}>
          {member.allocated >= 90 ? "Critical" : member.allocated >= 70 ? "High" : "Normal"}
        </span>
      </div>
    </Card>
  );
}
