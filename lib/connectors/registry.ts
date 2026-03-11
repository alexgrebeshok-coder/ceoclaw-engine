import { createEmailConnector } from "@/lib/connectors/adapters/email";
import { createGpsConnector } from "@/lib/connectors/adapters/gps";
import { createOneCConnector } from "@/lib/connectors/adapters/one-c";
import { createTelegramConnector } from "@/lib/connectors/adapters/telegram";
import type {
  ConnectorAdapter,
  ConnectorId,
  ConnectorStatus,
  ConnectorStatusSummary,
} from "@/lib/connectors/types";

type RuntimeEnv = NodeJS.ProcessEnv;

export class ConnectorRegistry {
  private readonly connectors = new Map<ConnectorId, ConnectorAdapter>();

  register(connector: ConnectorAdapter): this {
    if (this.connectors.has(connector.id)) {
      throw new Error(`Connector '${connector.id}' is already registered.`);
    }

    this.connectors.set(connector.id, connector);
    return this;
  }

  get(id: string): ConnectorAdapter | undefined {
    return this.connectors.get(id as ConnectorId);
  }

  list(): ConnectorAdapter[] {
    return Array.from(this.connectors.values());
  }

  async getStatus(id: string): Promise<ConnectorStatus | null> {
    const connector = this.get(id);
    if (!connector) {
      return null;
    }

    return connector.getStatus();
  }

  async getStatuses(): Promise<ConnectorStatus[]> {
    return Promise.all(this.list().map((connector) => connector.getStatus()));
  }
}

export function createConnectorRegistry(env: RuntimeEnv = process.env): ConnectorRegistry {
  return new ConnectorRegistry()
    .register(createTelegramConnector(env))
    .register(createEmailConnector(env))
    .register(createGpsConnector(env))
    .register(createOneCConnector(env));
}

export function summarizeConnectorStatuses(
  statuses: ConnectorStatus[]
): ConnectorStatusSummary {
  const summary = statuses.reduce(
    (accumulator, connector) => {
      accumulator.total += 1;
      if (connector.configured) {
        accumulator.configured += 1;
      }

      if (connector.status === "ok") {
        accumulator.ok += 1;
      } else if (connector.status === "degraded") {
        accumulator.degraded += 1;
      } else {
        accumulator.pending += 1;
      }

      return accumulator;
    },
    {
      total: 0,
      configured: 0,
      ok: 0,
      pending: 0,
      degraded: 0,
    }
  );

  const status =
    summary.degraded > 0 ? "degraded" : summary.pending > 0 ? "pending" : "ok";

  return {
    status,
    ...summary,
  };
}

const defaultRegistry = createConnectorRegistry();

export function getConnectorRegistry(): ConnectorRegistry {
  return defaultRegistry;
}
