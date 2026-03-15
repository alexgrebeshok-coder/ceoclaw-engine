/**
 * Admin API - Minimal migration for User table only
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Only create User table - needed for registration
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "name" TEXT,
        "email" TEXT UNIQUE,
        "emailVerified" TIMESTAMP(3),
        "image" TEXT,
        "password" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: 'User table ready'
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error)
    }, { status: 500 });
  }
}
