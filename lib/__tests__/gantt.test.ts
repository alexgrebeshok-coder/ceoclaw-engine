/**
 * Gantt API tests
 * 
 * Run with: npx tsx lib/__tests__/gantt.test.ts
 */

const API_BASE = "http://localhost:3000";

async function testGanttDependencies() {
  console.log("📊 Testing Gantt dependencies...");
  
  const response = await fetch(`${API_BASE}/api/gantt/dependencies`);
  const data = await response.json();
  
  console.log("Status:", response.status);
  console.log("Dependencies count:", data.length);
  
  if (response.status === 200 && Array.isArray(data)) {
    console.log("✅ Gantt dependencies fetched");
    if (data.length > 0) {
      console.log("  First link:", data[0].sourceTask, "→", data[0].targetTask);
    }
  } else {
    console.log("❌ Failed to fetch Gantt dependencies");
    console.log("Response:", data);
  }
}

async function runTests() {
  console.log("🚀 Starting Gantt API tests...\n");
  console.log("=".repeat(50));
  
  try {
    await testGanttDependencies();
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ All Gantt tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  }
}

runTests();
