import { createStubConnector } from "@/lib/connectors/stub";
import type { ConnectorAdapter } from "@/lib/connectors/types";

type RuntimeEnv = NodeJS.ProcessEnv;

export function createEmailConnector(env: RuntimeEnv = process.env): ConnectorAdapter {
  return createStubConnector(
    {
      id: "email",
      name: "Email",
      description:
        "Outbound email channel for executive digests, approvals, and escalation notices. Prepared as an SMTP-backed stub.",
      direction: "outbound",
      sourceSystem: "SMTP-compatible provider",
      operations: [
        "Send executive brief digests",
        "Send approval and escalation notifications",
      ],
      credentials: [
        {
          envVar: "EMAIL_FROM",
          description: "Default sender identity for outbound messages.",
        },
        {
          envVar: "SMTP_HOST",
          description: "SMTP server hostname.",
        },
        {
          envVar: "SMTP_USER",
          description: "SMTP username or service account.",
        },
        {
          envVar: "SMTP_PASSWORD",
          description: "SMTP password or app-specific secret.",
        },
      ],
      apiSurface: [
        {
          method: "GET",
          path: "/api/connectors/email",
          description: "Connector status for the email channel.",
        },
      ],
      stub: true,
    },
    env
  );
}
