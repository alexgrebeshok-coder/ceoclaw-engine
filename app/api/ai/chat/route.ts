/**
 * AI Chat API - Chat with AI providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIRouter } from '@/lib/ai/providers';
import { MemoryManager } from '@/lib/memory/memory-store';

export async function POST(req: NextRequest) {
  try {
    const { message, projectId, provider, model } = await req.json();

    // Initialize
    const router = new AIRouter();
    const memory = new MemoryManager();

    // Build context
    const context = await buildContext(memory, projectId);

    // System prompt
    const systemPrompt = `Ты CEOClaw AI — ассистент для управления проектами.

Контекст:
${JSON.stringify(context, null, 2)}

Отвечай кратко, по делу. Используй данные из контекста.
Если не хватает данных — спроси уточнение.`;

    // Chat with AI
    const response = await router.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      { provider, model }
    );

    // Save to memory
    await memory.remember({
      type: 'episodic',
      category: 'chat',
      key: `chat-${Date.now()}`,
      value: { user: message, assistant: response },
    });

    return NextResponse.json({
      success: true,
      response,
      provider: provider || 'default',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Build context for AI
 */
async function buildContext(memory: MemoryManager, projectId?: string) {
  const [longTerm, episodic] = await Promise.all([
    memory.getLongTerm(),
    memory.getEpisodic(),
  ]);

  return {
    memory: {
      longTerm: longTerm.slice(0, 10), // Top 10
      recent: episodic.slice(0, 5), // Last 5
    },
    projectId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * GET - Available providers and models
 */
export async function GET() {
  const router = new AIRouter();

  return NextResponse.json({
    providers: router.getAvailableProviders(),
    models: router.getAvailableModels(),
    default: 'openrouter',
  });
}
