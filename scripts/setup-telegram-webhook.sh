#!/bin/bash

# Setup Telegram Bot Webhook
# Usage: ./scripts/setup-telegram-webhook.sh <bot_token> <webhook_url>

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <bot_token> <webhook_url>"
  echo ""
  echo "Example:"
  echo "  $0 123456:ABC-DEF https://your-domain.com/api/telegram/webhook"
  exit 1
fi

BOT_TOKEN="$1"
WEBHOOK_URL="$2"

echo "🔧 Setting up Telegram webhook..."
echo "Bot Token: ${BOT_TOKEN:0:10}..."
echo "Webhook URL: $WEBHOOK_URL"
echo ""

# Set webhook
RESPONSE=$(curl -s -X POST \
  "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\"}")

echo "Response:"
echo "$RESPONSE" | jq .

# Verify webhook info
echo ""
echo "📋 Webhook info:"
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | jq .

echo ""
echo "✅ Done!"
