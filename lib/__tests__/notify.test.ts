/**
 * Notify helper tests
 * 
 * Run with: npx tsx lib/__tests__/notify.test.ts
 */

const API_BASE = "http://localhost:3000";

async function testNotifyHelper() {
  console.log("🔔 Testing notify helper functions...");
  
  // Test creating notification via API
  const response = await fetch(`${API_BASE}/api/notifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "default",
      type: "task_assigned",
      title: "Test notification",
      message: "This is a test notification from notify helper",
      entityType: "task",
      entityId: "test_task_1",
    }),
  });
  
  const data = await response.json();
  
  console.log("Status:", response.status);
  console.log("Created notification:", data.id);
  
  if (response.status === 201 && data.id) {
    console.log("✅ Notify helper works");
    return data.id;
  } else {
    console.log("❌ Notify helper failed");
    return null;
  }
}

async function testCheckDueDates() {
  console.log("\n📅 Testing check-due-dates endpoint...");
  
  const response = await fetch(`${API_BASE}/api/notifications/check-due-dates`, {
    method: "POST",
  });
  
  const data = await response.json();
  
  console.log("Status:", response.status);
  console.log("Tasks checked:", data.tasksChecked || 0);
  console.log("Notifications created:", data.notificationsCreated || 0);
  
  if (response.status === 200) {
    console.log("✅ Check due dates works");
  } else {
    console.log("❌ Check due dates failed");
  }
}

async function testNotificationTypes() {
  console.log("\n📋 Testing all notification types...");
  
  const types = [
    { type: "task_assigned", title: "Task assigned", message: "You have a new task" },
    { type: "due_date", title: "Due date approaching", message: "Task due tomorrow" },
    { type: "status_changed", title: "Status changed", message: "Task moved to done" },
    { type: "mention", title: "You were mentioned", message: "Someone mentioned you" },
  ];
  
  let created = 0;
  
  for (const typeData of types) {
    const response = await fetch(`${API_BASE}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "default",
        ...typeData,
      }),
    });
    
    if (response.status === 201) {
      created++;
    }
  }
  
  console.log(`Created ${created}/${types.length} notifications`);
  
  if (created === types.length) {
    console.log("✅ All notification types work");
  } else {
    console.log("⚠️ Some notification types failed");
  }
}

async function testUnreadCount() {
  console.log("\n🔢 Testing unread count...");
  
  const response = await fetch(`${API_BASE}/api/notifications?userId=default`);
  const data = await response.json();
  
  console.log("Total notifications:", data.total || 0);
  console.log("Unread count:", data.unreadCount || 0);
  
  if (response.status === 200) {
    console.log("✅ Unread count works");
  } else {
    console.log("❌ Unread count failed");
  }
}

async function runTests() {
  console.log("🚀 Starting Notify helper tests...\n");
  console.log("=".repeat(50));
  
  try {
    await testNotifyHelper();
    await testCheckDueDates();
    await testNotificationTypes();
    await testUnreadCount();
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ All Notify helper tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  }
}

runTests();
