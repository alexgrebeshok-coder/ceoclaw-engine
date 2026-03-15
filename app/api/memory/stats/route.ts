/**
 * Memory Stats API - GET /api/memory/stats
 */

import { NextResponse } from 'next/server';
import { prismaMemoryManager } from '@/lib/memory/prisma-memory-manager';

/**
 * GET /api/memory/stats - Get memory statistics
 */
export async function GET() {
  try {
    const stats = await prismaMemoryManager.getStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[Memory API] Stats error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
