import { generatePortfolioBrief, generateProjectBrief } from "@/lib/briefs/generate";
import { resolveBriefLocale, type BriefLocale } from "@/lib/briefs/locale";
import {
  getTelegramDefaultChatId,
  getTelegramToken,
  sendTelegramTextMessage,
} from "@/lib/connectors/telegram-client";

type TelegramDeliveryScope = "portfolio" | "project";

export interface TelegramBriefDeliveryRequest {
  scope: TelegramDeliveryScope;
  projectId?: string;
  locale?: BriefLocale;
  chatId?: string | null;
  dryRun?: boolean;
}

export interface TelegramBriefDeliveryResult {
  scope: TelegramDeliveryScope;
  locale: BriefLocale;
  chatId: string | null;
  headline: string;
  delivered: boolean;
  dryRun: boolean;
  messageText: string;
  messageId?: number;
}

interface TelegramBriefDeliveryDeps {
  env?: NodeJS.ProcessEnv;
  sendMessage?: typeof sendTelegramTextMessage;
  generatePortfolio?: typeof generatePortfolioBrief;
  generateProject?: typeof generateProjectBrief;
}

export async function deliverBriefToTelegram(
  request: TelegramBriefDeliveryRequest,
  deps: TelegramBriefDeliveryDeps = {}
): Promise<TelegramBriefDeliveryResult> {
  const env = deps.env ?? process.env;
  const locale = resolveBriefLocale(request.locale);
  const generatePortfolio = deps.generatePortfolio ?? generatePortfolioBrief;
  const generateProject = deps.generateProject ?? generateProjectBrief;
  const sendMessage = deps.sendMessage ?? sendTelegramTextMessage;

  if (request.scope === "project" && !request.projectId) {
    throw new Error("projectId is required for project brief delivery.");
  }

  const brief =
    request.scope === "portfolio"
      ? await generatePortfolio({ locale })
      : await generateProject(request.projectId!, { locale });

  const messageText = brief.formats.telegramDigest;
  const chatId = request.chatId?.trim() || getTelegramDefaultChatId(env);

  if (!request.dryRun && !chatId) {
    throw new Error("Telegram chat id is required when no TELEGRAM_DEFAULT_CHAT_ID is configured.");
  }

  if (request.dryRun) {
    return {
      scope: request.scope,
      locale,
      chatId: chatId ?? null,
      headline: brief.headline,
      delivered: false,
      dryRun: true,
      messageText,
    };
  }

  const token = getTelegramToken(env);
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  }

  const sendResult = await sendMessage({
    token,
    chatId: chatId!,
    text: messageText,
  });

  if (!sendResult.ok) {
    throw new Error(sendResult.message);
  }

  return {
    scope: request.scope,
    locale,
    chatId: String(chatId),
    headline: brief.headline,
    delivered: true,
    dryRun: false,
    messageText,
    messageId: sendResult.result.message_id,
  };
}
