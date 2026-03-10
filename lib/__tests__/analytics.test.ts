/**
 * Analytics API tests
 * 
 * Run with: npx tsx lib/__tests__/analytics.test.ts
 */

const API_BASE = "http://localhost:3000";

async function testAnalyticsOverview() {
  console.log("📊 Testing analytics overview...");
  
  const response = await fetch(`${API_BASE}/api/analytics/overview`);
  const data = await response.json();
  
  console.log("Status:", response.status);
  console.log("Summary:", data.summary);
  console.log("Projects count:", data.projects?.length);
  
  if (response.status === 200 && data.summary && data.projects) {
    console.log("✅ Analytics overview generated");
  } else {
    console.log("❌ Failed to generate analytics overview");
    console.log("Response:", data);
  }
}

async function testTeamPerformance() {
  console.log("\n👥 Testing team performance...");
  
  const response = await fetch(`${API_BASE}/api/analytics/team-performance`);
  const data = await response.json();
  
  console.log("Status:", response.status);
  console.log("Summary:", data.summary);
  console.log("Members count:", data.members?.length);
  
  if (response.status === 200 && data.summary && data.members) {
    console.log("✅ Team performance calculated");
  } else {
    console.log("❌ Failed to calculate team performance");
    console.log("Response:", data);
  }
}

async function testProjectFilter() {
  console.log("\n🔍 Testing project filter...");
  
  // Get first project
  const projectsRes = await fetch(`${API_BASE}/api/projects`);
  const projects = await projectsRes.json();
  const projectId = projects[0]?.id;
  
  if (!projectId) {
    console.log("⚠️ No projects found, skipping filter test");
    return;
  }
  
  const response = await fetch(
    `${API_BASE}/api/analytics/overview?projectId=${projectId}`
  );
  const data = await response.json();
  
  console.log("Status:", response.status);
  console.log("Projects returned:", data.projects?.length);
  
  if (response.status === 200 && data.projects?.length === 1) {
    console.log("✅ Project filter works");
  } else {
    console.log("❌ Project filter failed");
  }
}

async function runTests() {
  console.log("🚀 Starting Analytics API tests...\n");
  console.log("=".repeat(50));
  
  try {
    await testAnalyticsOverview();
    await testTeamPerformance();
    await testProjectFilter();
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ All analytics tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  }
}

runTests();
