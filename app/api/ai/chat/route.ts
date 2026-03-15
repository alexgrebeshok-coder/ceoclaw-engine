/**
 * AI Chat API - Chat with AI providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIRouter } from '@/lib/ai/providers';
import { prismaMemoryManager, prismaContextBuilder } from '@/lib/memory/prisma-memory-manager';

export async function POST(req: NextRequest) {
  try {
    const { message, projectId, provider, model } = await req.json();

    // Initialize
    const router = new AIRouter();

    // Build context from Prisma memory
    const context = await prismaContextBuilder.build();

    // System prompt
    const systemPrompt = `Ты CEOClaw AI — ассистент для управления проектами.

Контекст:
${context}

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

    // Save to Prisma memory
    await prismaMemoryManager.add({
      type: 'episodic',
      category: 'chat',
      key: `chat-${Date.now()}`,
      value: { user: message, assistant: response },
      validFrom: new Date(),
      validUntil: null,
      confidence: 100,
      source: 'system',
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
