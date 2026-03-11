import assert from "node:assert/strict";

import { createTelegramConnector } from "@/lib/connectors";

function createJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function testMissingTokenStaysPending() {
  const connector = createTelegramConnector({} as NodeJS.ProcessEnv);
  const status = await connector.getStatus();

  assert.equal(status.stub, false);
  assert.equal(status.configured, false);
  assert.equal(status.status, "pending");
  assert.deepEqual(status.missingSecrets, ["TELEGRAM_BOT_TOKEN"]);
}

async function testHealthyProbeReturnsOk() {
  const connector = createTelegramConnector(
    {
      TELEGRAM_BOT_TOKEN: "telegram-token",
    } as NodeJS.ProcessEnv,
    (async (input: string | URL | Request) => {
      const url = String(input);

      if (url.includes("/getMe")) {
        return createJsonResponse({
          ok: true,
          result: {
            id: 777000,
            is_bot: true,
            first_name: "CEOClaw Bot",
            username: "ceoclaw_bot",
            can_join_groups: true,
          },
        });
      }

      if (url.includes("/getWebhookInfo")) {
        return createJsonResponse({
          ok: true,
          result: {
            url: "https://example.com/api/telegram/webhook",
            pending_update_count: 0,
            has_custom_certificate: false,
          },
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    }) as typeof fetch
  );

  const status = await connector.getStatus();

  assert.equal(status.status, "ok");
  assert.equal(status.configured, true);
  assert.equal(status.metadata?.botUsername, "ceoclaw_bot");
  assert.equal(status.metadata?.webhookConfigured, true);
}

async function testMissingWebhookReturnsDegraded() {
  const connector = createTelegramConnector(
    {
      TELEGRAM_BOT_TOKEN: "telegram-token",
    } as NodeJS.ProcessEnv,
    (async (input: string | URL | Request) => {
      const url = String(input);

      if (url.includes("/getMe")) {
        return createJsonResponse({
          ok: true,
          result: {
            id: 777000,
            is_bot: true,
            first_name: "CEOClaw Bot",
            username: "ceoclaw_bot",
          },
        });
      }

      if (url.includes("/getWebhookInfo")) {
        return createJsonResponse({
          ok: true,
          result: {
            url: "",
            pending_update_count: 0,
          },
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    }) as typeof fetch
  );

  const status = await connector.getStatus();

  assert.equal(status.status, "degraded");
  assert.match(status.message, /webhook is not configured/i);
  assert.equal(status.metadata?.webhookConfigured, false);
}

async function main() {
  await testMissingTokenStaysPending();
  await testHealthyProbeReturnsOk();
  await testMissingWebhookReturnsDegraded();
  console.log("PASS telegram-connector.unit");
}

void main();
