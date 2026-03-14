/**
 * Test script for Agent Orchestrator
 */

const BASE_URL = 'http://localhost:3000';

async function test() {
  console.log('🧪 Testing Agent Orchestrator\n');

  // Test 1: List agents
  console.log('1️⃣ Testing GET /api/agents/execute (list agents)');
  try {
    const response = await fetch(`${BASE_URL}/api/agents/execute`);
    const data = await response.json();
    console.log('✅ Agents:', data.agents?.map((a: any) => a.id).join(', '));
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log();

  // Test 2: Execute single agent
  console.log('2️⃣ Testing POST /api/agents/execute (single agent)');
  try {
    const response = await fetch(`${BASE_URL}/api/agents/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'quick-research',
        task: 'Найди информацию о OpenAI GPT-5.2 модели',
      }),
    });
    const data = await response.json();

    if (data.success) {
      console.log('✅ Agent:', data.result.agentId);
      console.log('✅ Response:', data.result.result.content.slice(0, 150) + '...');
      console.log('✅ Duration:', data.result.duration + 'ms');
      console.log('✅ Tokens:', data.result.result.tokens);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log();

  // Test 3: Smart delegation
  console.log('3️⃣ Testing POST /api/agents/execute (smart mode)');
  try {
    const response = await fetch(`${BASE_URL}/api/agents/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'smart',
        task: 'Напиши функцию для расчёта NPV на TypeScript',
      }),
    });
    const data = await response.json();

    if (data.success) {
      console.log('✅ Mode: smart');
      console.log('✅ Agent:', data.result.agentId);
      console.log('✅ Response:', data.result.result.content.slice(0, 150) + '...');
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log();

  // Test 4: Parallel execution
  console.log('4️⃣ Testing POST /api/agents/execute (parallel mode)');
  try {
    const response = await fetch(`${BASE_URL}/api/agents/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'parallel',
        tasks: [
          { agentId: 'quick-research', task: 'Что такое EVM методология?' },
          { agentId: 'writer', task: 'Напиши краткое введение в управление проектами' },
        ],
      }),
    });
    const data = await response.json();

    if (data.success) {
      console.log('✅ Mode: parallel');
      console.log('✅ Results:', data.result.results.length);
      console.log('✅ Total duration:', data.result.totalDuration + 'ms');
      console.log('✅ Total tokens:', data.result.totalTokens);
      console.log('✅ Total cost: $' + data.result.totalCost.toFixed(4));
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log();

  // Test 5: Get stats
  console.log('5️⃣ Testing GET /api/agents/execute?stats=true');
  try {
    const response = await fetch(`${BASE_URL}/api/agents/execute?stats=true`);
    const data = await response.json();
    console.log('✅ Stats:', JSON.stringify(data.stats, null, 2));
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log('\n✅ Tests complete!');
}

test().catch(console.error);
