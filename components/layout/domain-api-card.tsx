import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DomainEndpoint {
  method: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  note: string;
  path: string;
}

function getMethodVariant(method: DomainEndpoint["method"]) {
  switch (method) {
    case "GET":
      return "info";
    case "POST":
      return "success";
    case "PATCH":
    case "PUT":
      return "warning";
    case "DELETE":
      return "danger";
    default:
      return "neutral";
  }
}

export function DomainApiCard({
  description,
  endpoints,
  title,
}: {
  description: string;
  endpoints: DomainEndpoint[];
  title: string;
}) {
  return (
    <Card className="h-full min-w-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-3">
        {endpoints.map((endpoint) => (
          <div
            key={`${endpoint.method}:${endpoint.path}`}
            className="min-w-0 rounded-[12px] border border-[var(--line)] bg-[var(--panel-soft)] p-4"
          >
            <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Badge variant={getMethodVariant(endpoint.method)}>{endpoint.method}</Badge>
              <code className="min-w-0 break-all text-sm font-semibold text-[var(--ink)]">
                {endpoint.path}
              </code>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{endpoint.note}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
