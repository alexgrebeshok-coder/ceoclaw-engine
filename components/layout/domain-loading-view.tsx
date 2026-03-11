import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DomainLoadingView() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-14 w-72 max-w-full" />
          <Skeleton className="h-4 w-[620px] max-w-full" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-7 w-32 rounded-full" />
            ))}
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index}>
            <CardContent className="space-y-4 p-5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <Card>
          <CardHeader className="space-y-3">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="grid gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-[12px]" />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-3">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="grid gap-3">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-11 w-full rounded-md" />
            ))}
            <Skeleton className="h-10 w-40 rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
