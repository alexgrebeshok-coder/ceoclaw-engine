export { createEmailConnector } from "@/lib/connectors/adapters/email";
export { createGpsConnector } from "@/lib/connectors/adapters/gps";
export { createOneCConnector } from "@/lib/connectors/adapters/one-c";
export { createTelegramConnector } from "@/lib/connectors/adapters/telegram";
export {
  ConnectorRegistry,
  createConnectorRegistry,
  getConnectorRegistry,
  summarizeConnectorStatuses,
} from "@/lib/connectors/registry";
export type {
  ConnectorAdapter,
  ConnectorApiSurface,
  ConnectorCredentialRequirement,
  ConnectorDescriptor,
  ConnectorDirection,
  ConnectorId,
  ConnectorStatus,
  ConnectorStatusLevel,
  ConnectorStatusSummary,
} from "@/lib/connectors/types";
