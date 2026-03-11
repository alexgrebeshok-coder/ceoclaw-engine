import { createStubConnector } from "@/lib/connectors/stub";
import type { ConnectorAdapter } from "@/lib/connectors/types";

type RuntimeEnv = NodeJS.ProcessEnv;

export function createOneCConnector(env: RuntimeEnv = process.env): ConnectorAdapter {
  return createStubConnector(
    {
      id: "one-c",
      name: "1C",
      description:
        "Bidirectional 1C connector prepared for ERP and PM data exchange, with AI-PMO treated as an analytical layer over 1C system-of-record data.",
      direction: "bidirectional",
      sourceSystem: "1C:ERP / 1C:PM HTTP APIs",
      operations: [
        "Read financial and project master data from 1C",
        "Prepare write-back surface for alerts and recommendations",
      ],
      credentials: [
        {
          envVar: "ONE_C_BASE_URL",
          description: "Base URL for 1C HTTP or OData endpoints.",
        },
        {
          envVar: "ONE_C_API_KEY",
          description: "Service API key or equivalent auth token for 1C.",
        },
      ],
      apiSurface: [
        {
          method: "GET",
          path: "/api/connectors/one-c",
          description: "Connector status for 1C integration.",
        },
      ],
      stub: true,
    },
    env
  );
}
