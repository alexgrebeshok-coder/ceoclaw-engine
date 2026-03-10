/**
 * Telegram Webhook endpoint test
 * 
 * Run with: npx tsx lib/__tests__/telegram-webhook.test.ts
 */

const WEBHOOK_URL = "http://localhost:3000/api/telegram/webhook";

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name: string };
    chat: { id: number; type: string };
    text?: string;
  };
}

async function testWebhookGET() {
  console.log("🔍 Testing GET /api/telegram/webhook...");
  
  const response = await fetch(WEBHOOK_URL);
  const data = await response.json();
  
  console.log("Status:", response.status);
  console.log("Response:", data);
  
  if (data.status === "ok") {
    console.log("✅ Webhook endpoint is ready");
  } else {
    console.log("❌ Unexpected response");
  }
}

async function testWebhookPOST() {
  console.log("\n📝 Testing POST /api/telegram/webhook (listProjects)...");
  
  const update: TelegramUpdate = {
    update_id: 1,
    message: {
      message_id: 1,
      from: { id: 1258992460, first_name: "Александр" },
      chat: { id: 1258992460, type: "private" },
      text: "Покажи проекты",
    },
  };
  
  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  
  const data = await response.json();
  
  console.log("Status:", response.status);
  console.log("Response:", data);
  
  if (data.ok === true) {
    console.log("✅ Webhook processed message");
  } else {
    console.log("❌ Unexpected response");
  }
}

async function testShowStatus() {
  console.log("\n📊 Testing showStatus command...");
  
  const update: TelegramUpdate = {
    update_id: 2,
    message: {
      message_id: 2,
      from: { id: 1258992460, first_name: "Александр" },
      chat: { id: 1258992460, type: "private" },
      text: "Статус ЧЭМК",
    },
  };
  
  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  
  const data = await response.json();
  
  console.log("Status:", response.status);
  console.log("Response:", data);
  
  if (data.ok === true) {
    console.log("✅ Status command processed");
  } else {
    console.log("❌ Unexpected response");
  }
}

async function runTests() {
  console.log("🚀 Starting Telegram Webhook tests...\n");
  console.log("=".repeat(50));
  
  try {
    await testWebhookGET();
    await testWebhookPOST();
    await testShowStatus();
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

runTests();
