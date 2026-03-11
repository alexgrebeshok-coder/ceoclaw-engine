export const CONNECTOR_IDS = ["telegram", "email", "gps", "one-c"] as const;

export type ConnectorId = (typeof CONNECTOR_IDS)[number];
export type ConnectorDirection = "inbound" | "outbound" | "bidirectional";
export type ConnectorStatusLevel = "ok" | "pending" | "degraded";
export type ConnectorSurfaceMethod = "GET" | "POST" | "WEBHOOK";

export interface ConnectorCredentialRequirement {
  envVar: string;
  description: string;
  required?: boolean;
}

export interface ConnectorApiSurface {
  method: ConnectorSurfaceMethod;
  path: string;
  description: string;
}

export interface ConnectorDescriptor {
  id: ConnectorId;
  name: string;
  description: string;
  direction: ConnectorDirection;
  sourceSystem: string;
  operations: string[];
  credentials: ConnectorCredentialRequirement[];
  apiSurface: ConnectorApiSurface[];
  stub: boolean;
}

export interface ConnectorStatus extends ConnectorDescriptor {
  status: ConnectorStatusLevel;
  configured: boolean;
  checkedAt: string;
  message: string;
  missingSecrets: string[];
  metadata?: Record<string, string | number | boolean | null>;
}

export interface ConnectorStatusSummary {
  status: ConnectorStatusLevel;
  total: number;
  configured: number;
  ok: number;
  pending: number;
  degraded: number;
}

export interface ConnectorAdapter extends ConnectorDescriptor {
  getStatus(): Promise<ConnectorStatus>;
}
