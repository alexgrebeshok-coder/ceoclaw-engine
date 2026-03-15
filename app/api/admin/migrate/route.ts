/**
 * Admin API - Run Prisma migrations
 * 
 * This endpoint creates database tables on Vercel (where Neon is accessible)
 * Call once after deployment: curl https://your-app.vercel.app/api/admin/migrate
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const results: string[] = [];
  
  try {
    // ============================================
    // NEXTAUTH TABLES
    // ============================================
    
    // Users table
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
    results.push('User table created');

    // Accounts table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
      );
    `;
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");
    `;
    results.push('Account table created');

    // Sessions table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL,
        "sessionToken" TEXT NOT NULL UNIQUE,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
      );
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
    `;
    results.push('Session table created');

    // VerificationToken table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "VerificationToken" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "expires" TIMESTAMP(3) NOT NULL
      );
    `;
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
    `;
    results.push('VerificationToken table created');

    // ============================================
    // BUSINESS TABLES
    // ============================================

    // Organization table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Organization" (
        "id" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "description" TEXT,
        CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
      );
    `;
    results.push('Organization table created');

    // Workspace table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Workspace" (
        "id" TEXT NOT NULL,
        "organizationId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
      );
    `;
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Workspace_organizationId_slug_key" ON "Workspace"("organizationId", "slug");
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Workspace_organizationId_idx" ON "Workspace"("organizationId");
    `;
    results.push('Workspace table created');

    // Membership table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Membership" (
        "id" TEXT NOT NULL,
        "organizationId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'member',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
      );
    `;
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Membership_organizationId_userId_key" ON "Membership"("organizationId", "userId");
    `;
    results.push('Membership table created');

    // Project table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Project" (
        "id" TEXT NOT NULL,
        "workspaceId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'planning',
        "priority" TEXT NOT NULL DEFAULT 'medium',
        "progress" INTEGER NOT NULL DEFAULT 0,
        "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "startDate" TIMESTAMP(3),
        "endDate" TIMESTAMP(3),
        "location" TEXT,
        "category" TEXT,
        "managerId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
      );
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Project_workspaceId_idx" ON "Project"("workspaceId");
    `;
    results.push('Project table created');

    // Task table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Task" (
        "id" TEXT NOT NULL,
        "projectId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'todo',
        "priority" TEXT NOT NULL DEFAULT 'medium',
        "assigneeId" TEXT,
        "dueDate" TIMESTAMP(3),
        "estimatedHours" DOUBLE PRECISION,
        "actualHours" DOUBLE PRECISION,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
      );
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Task_projectId_idx" ON "Task"("projectId");
    `;
    results.push('Task table created');

    // TeamMember table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "TeamMember" (
        "id" TEXT NOT NULL,
        "workspaceId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT,
        "role" TEXT NOT NULL,
        "avatar" TEXT,
        "department" TEXT,
        "phone" TEXT,
        "capacity" INTEGER NOT NULL DEFAULT 100,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
      );
    `;
    results.push('TeamMember table created');

    // Risk table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Risk" (
        "id" TEXT NOT NULL,
        "projectId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "probability" INTEGER NOT NULL DEFAULT 1,
        "impact" INTEGER NOT NULL DEFAULT 1,
        "status" TEXT NOT NULL DEFAULT 'open',
        "ownerId" TEXT,
        "mitigation" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
      );
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Risk_projectId_idx" ON "Risk"("projectId");
    `;
    results.push('Risk table created');

    // Memory table (for AI)
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
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Memory_type_idx" ON "Memory"("type");
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Memory_category_idx" ON "Memory"("category");
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Memory_key_idx" ON "Memory"("key");
    `;
    results.push('Memory table created');

    return NextResponse.json({ 
      success: true, 
      message: 'All tables created successfully',
      tables: results
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error),
      created: results
    }, { status: 500 });
  }
}
