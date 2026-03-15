/**
 * Memory Search API - POST /api/memory/search
 */

import { NextRequest, NextResponse } from 'next/server';
import { prismaMemoryManager } from '@/lib/memory/prisma-memory-manager';

/**
 * POST /api/memory/search - Search memories
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    const memories = await prismaMemoryManager.search(query);

    return NextResponse.json({
      success: true,
      count: memories.length,
      query,
      memories,
    });
  } catch (error) {
    console.error('[Memory API] Search error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
