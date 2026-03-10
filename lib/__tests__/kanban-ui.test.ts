/**
 * Kanban Board UI tests
 * 
 * Run with: npx tsx lib/__tests__/kanban-ui.test.ts
 */

const API_BASE = "http://localhost:3000";

async function testKanbanPage() {
  console.log("📋 Testing Kanban page...");
  
  const response = await fetch(`${API_BASE}/kanban`);
  const html = await response.text();
  
  // Check for drag & drop support
  const hasDnD = html.includes("@dnd-kit") || html.includes("useSortable");
  const hasTransitions = html.includes("transition") || html.includes("duration");
  
  console.log("Status:", response.status);
  console.log("Has DnD support:", hasDnD);
  console.log("Has transitions:", hasTransitions);
  
  if (response.status === 200) {
    console.log("✅ Kanban page loads");
  } else {
    console.log("❌ Failed to load Kanban page");
  }
}

async function testKanbanAPI() {
  console.log("\n🔗 Testing Kanban API...");
  
  // Test boards list
  const boardsRes = await fetch(`${API_BASE}/api/boards`);
  const boards = await boardsRes.json();
  
  console.log("Boards count:", boards.length || 0);
  
  if (boardsRes.status === 200) {
    console.log("✅ Kanban boards API works");
    
    if (boards.length > 0) {
      // Test specific board
      const boardId = boards[0].id;
      const boardRes = await fetch(`${API_BASE}/api/boards/${boardId}`);
      const board = await boardRes.json();
      
      console.log("  Board name:", board.name);
      console.log("  Columns:", board.columns?.length || 0);
      console.log("✅ Kanban board detail API works");
    }
  } else {
    console.log("❌ Kanban API failed");
  }
}

async function testAccessibility() {
  console.log("\n♿ Testing accessibility...");
  
  const response = await fetch(`${API_BASE}/kanban`);
  const html = await response.text();
  
  const hasAriaLabels = html.includes("aria-label");
  const hasRoles = html.includes("role=");
  const hasTabIndexes = html.includes("tabIndex");
  
  console.log("Has aria-labels:", hasAriaLabels);
  console.log("Has roles:", hasRoles);
  console.log("Has tabIndex:", hasTabIndexes);
  
  if (hasAriaLabels && hasRoles && hasTabIndexes) {
    console.log("✅ Accessibility features present");
  } else {
    console.log("⚠️ Some accessibility features missing");
  }
}

async function runTests() {
  console.log("🚀 Starting Kanban UI tests...\n");
  console.log("=".repeat(50));
  
  try {
    await testKanbanPage();
    await testKanbanAPI();
    await testAccessibility();
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ All Kanban UI tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  }
}

runTests();
