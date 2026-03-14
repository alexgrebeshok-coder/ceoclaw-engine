/**
 * Agent Execute API - Run agents
 */

import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/lib/agents/orchestrator';
import { MemoryManager } from '@/lib/memory/memory-store';

// ============================================
// POST - Execute agent
// ============================================

export async function POST(req: NextRequest) {
  try {
    const { agentId, task, projectId, mode, tasks } = await req.json();

    const orchestrator = new AgentOrchestrator();
    const memory = new MemoryManager();

    // Build context
    const context = await buildContext(memory, projectId);

    let result;

    if (mode === 'parallel' && tasks) {
      // Parallel execution
      result = await orchestrator.executeParallel(tasks, context);
    } else if (mode === 'smart') {
      // Smart delegation
      result = await orchestrator.smartExecute(task, context);
    } else {
      // Single agent
      result = await orchestrator.execute(agentId || 'main', task, context);
    }

    // Save to memory
    await memory.remember({
      type: 'episodic',
      category: 'agent',
      key: `agent-${Date.now()}`,
      value: {
        agentId: result.agentId || 'parallel',
        task: task || 'parallel',
        success: result.success || result.result?.success,
      },
    });

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Agent execute error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================
// GET - Get agents and stats
// ============================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stats = searchParams.get('stats');
    const agentId = searchParams.get('agentId');

    const orchestrator = new AgentOrchestrator();

    if (stats) {
      // Get stats
      const agentStats = await orchestrator.getStats(agentId || undefined);
      return NextResponse.json({ stats: agentStats });
    }

    // Get all agents
    const agents = orchestrator.getAllAgents().map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      description: a.description,
    }));

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Agent list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================
// Helper: Build context
// ============================================

async function buildContext(memory: MemoryManager, projectId?: string) {
  const [longTerm, episodic] = await Promise.all([
    memory.getLongTerm(),
    memory.getEpisodic(),
  ]);

  return {
    memory: {
      longTerm: longTerm.slice(0, 10),
      recent: episodic.slice(0, 5),
    },
    projectId,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };
}
