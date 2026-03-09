"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataErrorState } from "@/components/ui/data-error-state";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/contexts/locale-context";
import { useTeam } from "@/lib/hooks/use-api";

function TeamSkeleton() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-40" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Card key={index} className="bg-[var(--panel-soft)]/60">
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-36" />
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function TeamPage() {
  const { t } = useLocale();
  const { error, isLoading, mutate, team } = useTeam();

  if (isLoading && team.length === 0) {
    return <TeamSkeleton />;
  }

  if (error && team.length === 0) {
    return (
      <DataErrorState
        actionLabel={t("action.retry")}
        description={t("error.loadDescription")}
        onRetry={() => {
          void mutate();
        }}
        title={t("error.loadTitle")}
      />
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("team.title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {team.map((member) => (
            <Card key={member.id} className="bg-[color:var(--surface-panel)]">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-semibold text-white">
                      {member.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-heading text-xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
                        {member.name}
                      </p>
                      <p className="text-sm text-[var(--ink-soft)]">{member.role}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      member.allocated >= 85
                        ? "danger"
                        : member.allocated >= 70
                          ? "warning"
                          : "success"
                    }
                  >
                    {member.allocated}%
                  </Badge>
                </div>
                <Progress value={member.allocated} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[8px] bg-[var(--panel-soft)] p-3 text-center">
                    <div className="text-lg font-semibold text-[var(--ink)]">{member.projects.length}</div>
                    <div className="text-xs text-[var(--ink-muted)]">{t("nav.projects")}</div>
                  </div>
                  <div className="rounded-[8px] bg-[var(--panel-soft)] p-3 text-center">
                    <div className="text-lg font-semibold text-[var(--ink)]">{member.allocated}%</div>
                    <div className="text-xs text-[var(--ink-muted)]">{t("analytics.resourceUtilization")}</div>
                  </div>
                </div>
                <div className="text-sm text-[var(--ink-soft)]">
                  <div>{member.location}</div>
                  <div>{member.email}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {member.projects.map((project) => (
                    <Badge key={project} variant="neutral">
                      {project}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
