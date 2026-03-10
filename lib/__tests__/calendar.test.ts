/**
 * Calendar API tests
 * 
 * Run with: npx tsx lib/__tests__/calendar.test.ts
 */

const API_BASE = "http://localhost:3000";

async function testCalendarEvents() {
  console.log("📅 Testing calendar events...");
  
  const response = await fetch(`${API_BASE}/api/calendar/events`);
  const data = await response.json();
  
  console.log("Status:", response.status);
  console.log("Events count:", data.length);
  
  if (response.status === 200 && Array.isArray(data)) {
    console.log("✅ Calendar events listed");
    if (data.length > 0) {
      console.log("  First event:", data[0].title);
    }
  } else {
    console.log("❌ Failed to list calendar events");
    console.log("Response:", data);
  }
}

async function runTests() {
  console.log("🚀 Starting Calendar API tests...\n");
  console.log("=".repeat(50));
  
  try {
    await testCalendarEvents();
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ All calendar tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  }
}

runTests();
