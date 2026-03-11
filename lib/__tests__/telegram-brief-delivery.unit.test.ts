import assert from "node:assert/strict";

import { deliverBriefToTelegram } from "@/lib/briefs/telegram-delivery";

async function testDryRunReturnsDigestPreview() {
  const result = await deliverBriefToTelegram(
    {
      scope: "portfolio",
      locale: "ru",
      dryRun: true,
    },
    {
      generatePortfolio: async () =>
        ({
          headline: "Портфельный сигнал",
          formats: {
            telegramDigest: "portfolio digest",
          },
        }) as never,
      generateProject: async () => {
        throw new Error("should not be called");
      },
    }
  );

  assert.equal(result.scope, "portfolio");
  assert.equal(result.delivered, false);
  assert.equal(result.dryRun, true);
  assert.equal(result.messageText, "portfolio digest");
}

async function testSendUsesDefaultChatId() {
  let sendPayload: { token: string; chatId: string | number; text: string } | null = null;

  const result = await deliverBriefToTelegram(
    {
      scope: "project",
      projectId: "p6",
      locale: "en",
    },
    {
      env: {
        TELEGRAM_BOT_TOKEN: "telegram-token",
        TELEGRAM_DEFAULT_CHAT_ID: "-10012345",
      } as NodeJS.ProcessEnv,
      generatePortfolio: async () => {
        throw new Error("should not be called");
      },
      generateProject: async () =>
        ({
          headline: "Project signal",
          formats: {
            telegramDigest: "project digest",
          },
        }) as never,
      sendMessage: async (input) => {
        sendPayload = input;
        return {
          ok: true,
          result: {
            message_id: 77,
          },
        };
      },
    }
  );

  assert.equal(result.scope, "project");
  assert.equal(result.delivered, true);
  assert.equal(result.chatId, "-10012345");
  assert.equal(result.messageId, 77);
  assert.deepEqual(sendPayload, {
    token: "telegram-token",
    chatId: "-10012345",
    text: "project digest",
  });
}

async function testSendRequiresChatIdWithoutDefault() {
  await assert.rejects(
    () =>
      deliverBriefToTelegram(
        {
          scope: "portfolio",
          locale: "ru",
        },
        {
          env: {
            TELEGRAM_BOT_TOKEN: "telegram-token",
          } as NodeJS.ProcessEnv,
          generatePortfolio: async () =>
            ({
              headline: "Portfolio signal",
              formats: {
                telegramDigest: "portfolio digest",
              },
            }) as never,
        }
      ),
    /chat id is required/i
  );
}

async function testSendPropagatesTelegramFailure() {
  await assert.rejects(
    () =>
      deliverBriefToTelegram(
        {
          scope: "portfolio",
          locale: "ru",
          chatId: "-10054321",
        },
        {
          env: {
            TELEGRAM_BOT_TOKEN: "telegram-token",
          } as NodeJS.ProcessEnv,
          generatePortfolio: async () =>
            ({
              headline: "Portfolio signal",
              formats: {
                telegramDigest: "portfolio digest",
              },
            }) as never,
          sendMessage: async () => ({
            ok: false,
            message: "HTTP 404 while calling sendMessage",
          }),
        }
      ),
    /HTTP 404 while calling sendMessage/
  );
}

async function main() {
  await testDryRunReturnsDigestPreview();
  await testSendUsesDefaultChatId();
  await testSendRequiresChatIdWithoutDefault();
  await testSendPropagatesTelegramFailure();
  console.log("PASS telegram-brief-delivery.unit");
}

void main();
