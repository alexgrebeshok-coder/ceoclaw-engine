import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConnectorStatus } from "@/lib/connectors";

export function ConnectorPolicyForm({
  connectors,
}: {
  connectors: ConnectorStatus[];
}) {
  const liveConnectors = connectors.filter((connector) => !connector.stub).length;

  return (
    <Card className="h-full min-w-0">
      <CardHeader>
        <CardTitle>Connector setup notes</CardTitle>
        <CardDescription>
          Этот блок показывает, какие connectors уже работают как live probes, а какие пока остаются stubs и ждут deeper implementation.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-4">
        <div className="rounded-[16px] border border-[var(--line)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--ink-soft)]">
          Live connectors: <span className="font-semibold text-[var(--ink)]">{liveConnectors}</span>. Stub connectors:{" "}
          <span className="font-semibold text-[var(--ink)]">{connectors.length - liveConnectors}</span>.
        </div>
        {connectors.map((connector) => (
          <div
            key={connector.id}
            className="min-w-0 rounded-[16px] border border-[var(--line)] bg-[var(--panel-soft)] p-4"
          >
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="font-medium text-[var(--ink)]">{connector.name}</div>
                <div className="mt-1 break-words text-xs text-[var(--ink-soft)]">
                  {connector.operations.join(" · ")}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={connector.stub ? "info" : "success"}>
                  {connector.stub ? "Stub" : "Live probe"}
                </Badge>
                <Badge variant={connector.configured ? "success" : "warning"}>
                  {connector.configured ? "Configured" : "Secrets missing"}
                </Badge>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm">
              <div>
                <div className="font-medium text-[var(--ink)]">Required env vars</div>
                <div className="mt-1 text-[var(--ink-soft)]">
                  {connector.credentials.map((credential) => credential.envVar).join(", ")}
                </div>
              </div>

              <div>
                <div className="font-medium text-[var(--ink)]">Prepared API surface</div>
                <div className="mt-1 grid gap-2 text-[var(--ink-soft)]">
                  {connector.apiSurface.map((surface) => (
                    <div
                      className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2"
                      key={`${connector.id}:${surface.path}`}
                    >
                      <code className="font-semibold">{surface.method}</code>
                      <span className="break-all">{surface.path}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
