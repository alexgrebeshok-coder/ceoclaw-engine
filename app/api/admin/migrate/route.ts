/**
 * Admin API - Run Prisma migrations
 * 
 * This endpoint creates database tables on Vercel (where Neon is accessible)
 * Call once after deployment: curl https://your-app.vercel.app/api/admin/migrate
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Create Memory table if it doesn't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Memory" (
        "id" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "value" JSONB,
        "validFrom" TIMESTAMP(3) NOT NULL,
        "validUntil" TIMESTAMP(3),
        "confidence" INTEGER NOT NULL DEFAULT 100,
        "source" TEXT NOT NULL DEFAULT 'user',
        "tags" TEXT[],
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // Create indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Memory_type_idx" ON "Memory"("type");
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Memory_category_idx" ON "Memory"("category");
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Memory_key_idx" ON "Memory"("key");
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Memory table created successfully' 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}
