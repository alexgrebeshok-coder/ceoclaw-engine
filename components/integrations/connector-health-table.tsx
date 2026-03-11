import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ConnectorStatus } from "@/lib/connectors";

function statusVariant(status: ConnectorStatus["status"]) {
  switch (status) {
    case "ok":
      return "success";
    case "degraded":
      return "danger";
    case "pending":
    default:
      return "warning";
  }
}

function directionLabel(direction: ConnectorStatus["direction"]) {
  switch (direction) {
    case "bidirectional":
      return "Bi";
    case "inbound":
      return "Inbound";
    case "outbound":
    default:
      return "Outbound";
  }
}

function modeLabel(stub: boolean) {
  return stub ? "Stub" : "Live";
}

export function ConnectorHealthTable({
  connectors,
}: {
  connectors: ConnectorStatus[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connector health</CardTitle>
        <CardDescription>
          Реальный registry-backed статус по Telegram, GPS/GLONASS, Email и 1C.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Connector</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Source system</TableHead>
              <TableHead>Missing secrets</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {connectors.map((connector) => (
              <TableRow key={connector.id}>
                <TableCell className="max-w-[280px]">
                  <div className="font-medium text-[var(--ink)]">{connector.name}</div>
                  <div className="mt-1 text-xs text-[var(--ink-soft)]">
                    {connector.description}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={connector.stub ? "info" : "success"}>
                    {modeLabel(connector.stub)}
                  </Badge>
                </TableCell>
                <TableCell>{directionLabel(connector.direction)}</TableCell>
                <TableCell>{connector.sourceSystem}</TableCell>
                <TableCell className="text-xs text-[var(--ink-soft)]">
                  {connector.missingSecrets.length > 0
                    ? connector.missingSecrets.join(", ")
                    : "All required secrets are present."}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <Badge variant={statusVariant(connector.status)}>{connector.status}</Badge>
                    <span className="text-xs text-[var(--ink-soft)]">{connector.message}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
