/**
 * Test script for AI Backend
 */

const BASE_URL = 'http://localhost:3000';

async function test() {
  console.log('🧪 Testing CEOClaw AI Backend\n');

  // Test 1: Get available providers
  console.log('1️⃣ Testing GET /api/ai/chat (providers)');
  try {
    const response = await fetch(`${BASE_URL}/api/ai/chat`);
    const data = await response.json();
    console.log('✅ Providers:', data.providers);
    console.log('✅ Models:', data.models.length);
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log();

  // Test 2: Chat with AI
  console.log('2️⃣ Testing POST /api/ai/chat (chat)');
  try {
    const response = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Привет! Кто ты?',
      }),
    });
    const data = await response.json();

    if (data.success) {
      console.log('✅ Response:', data.response.slice(0, 100) + '...');
      console.log('✅ Provider:', data.provider);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log();

  // Test 3: Memory System
  console.log('3️⃣ Testing Memory System');
  try {
    const { MemoryManager } = await import('../lib/memory/memory-store');
    const memory = new MemoryManager();

    // Create memory
    const mem = await memory.remember({
      type: 'long_term',
      category: 'test',
      key: 'test-key',
      value: { content: 'Test memory' },
    });
    console.log('✅ Created:', mem.id);

    // Get memory
    const found = await memory.getByKey('test-key');
    console.log('✅ Found:', found?.key);

    // Delete memory
    await memory.forget(mem.id);
    console.log('✅ Deleted');
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log();

  // Test 4: Agent Sessions
  console.log('4️⃣ Testing Agent Sessions');
  try {
    const { AgentSessionManager } = await import('../lib/agents/agent-store');
    const sessions = new AgentSessionManager();

    // Create session
    const session = await sessions.createSession({
      agentId: 'main',
      task: 'Test task',
    });
    console.log('✅ Created:', session.id);

    // Start session
    await sessions.startSession(session.id);
    console.log('✅ Started');

    // Complete session
    await sessions.completeSession(session.id, { result: 'OK' }, 100, 0.01);
    console.log('✅ Completed');

    // Get stats
    const stats = await sessions.getAgentStats('main');
    console.log('✅ Stats:', stats);
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log('\n✅ Tests complete!');
}

test().catch(console.error);
