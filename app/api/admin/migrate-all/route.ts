/**
 * Admin API - Fix all tables (drop and recreate)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const results: string[] = [];

    // Drop all business tables in reverse dependency order
    const dropTables = [
      'DROP TABLE IF EXISTS "Notification" CASCADE',
      'DROP TABLE IF EXISTS "TimeEntry" CASCADE',
      'DROP TABLE IF EXISTS "TaskDependency" CASCADE',
      'DROP TABLE IF EXISTS "Column" CASCADE',
      'DROP TABLE IF EXISTS "Board" CASCADE',
      'DROP TABLE IF EXISTS "Document" CASCADE',
      'DROP TABLE IF EXISTS "Milestone" CASCADE',
      'DROP TABLE IF EXISTS "Risk" CASCADE',
      'DROP TABLE IF EXISTS "Task" CASCADE',
      'DROP TABLE IF EXISTS "Project" CASCADE',
      'DROP TABLE IF EXISTS "Memory" CASCADE',
    ];

    for (const sql of dropTables) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (e) {
        // Ignore if table doesn't exist
      }
    }
    results.push('Business tables dropped');

    // Create Organization table (if not exists with correct schema)
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Organization" (
        "id" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
      );
    `;
    results.push('Organization table ready');

    // Create Workspace table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Workspace" (
        "id" TEXT NOT NULL,
        "organizationId" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "initials" TEXT NOT NULL,
        "description" TEXT,
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
      );
    `;
    results.push('Workspace table ready');

    // Memory table
    await prisma.$executeRaw`
      CREATE TABLE "Memory" (
        "id" TEXT NOT NULL,
        "key" TEXT NOT NULL UNIQUE,
        "value" TEXT NOT NULL,
        "category" TEXT,
        "type" TEXT NOT NULL DEFAULT 'episodic',
        "source" TEXT,
        "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1,
        "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "validUntil" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
      );
    `;
    results.push('Memory table created ✅');

    // Project table
    await prisma.$executeRaw`
      CREATE TABLE "Project" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'planning',
        "priority" TEXT NOT NULL DEFAULT 'medium',
        "progress" INTEGER NOT NULL DEFAULT 0,
        "budget" DOUBLE PRECISION,
        "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "location" TEXT,
        "startDate" TIMESTAMP(3),
        "endDate" TIMESTAMP(3),
        "organizationId" TEXT NOT NULL,
        "workspaceId" TEXT,
        "ownerId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
      );
    `;
    results.push('Project table created');

    // Task table
    await prisma.$executeRaw`
      CREATE TABLE "Task" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'todo',
        "priority" TEXT NOT NULL DEFAULT 'medium',
        "progress" INTEGER NOT NULL DEFAULT 0,
        "dueDate" TIMESTAMP(3),
        "projectId" TEXT,
        "assigneeId" TEXT,
        "creatorId" TEXT,
        "estimatedHours" DOUBLE PRECISION,
        "actualHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
      );
    `;
    results.push('Task table created');

    // Risk table
    await prisma.$executeRaw`
      CREATE TABLE "Risk" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "probability" TEXT NOT NULL DEFAULT 'medium',
        "impact" TEXT NOT NULL DEFAULT 'medium',
        "status" TEXT NOT NULL DEFAULT 'open',
        "mitigation" TEXT,
        "owner" TEXT,
        "projectId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
      );
    `;
    results.push('Risk table created');

    // Milestone table
    await prisma.$executeRaw`
      CREATE TABLE "Milestone" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "date" TIMESTAMP(3) NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "projectId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
      );
    `;
    results.push('Milestone table created');

    // Document table
    await prisma.$executeRaw`
      CREATE TABLE "Document" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "size" INTEGER,
        "projectId" TEXT,
        "uploadedBy" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
      );
    `;
    results.push('Document table created');

    // Board table
    await prisma.$executeRaw`
      CREATE TABLE "Board" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'kanban',
        "projectId" TEXT,
        "workspaceId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
      );
    `;
    results.push('Board table created');

    // Column table
    await prisma.$executeRaw`
      CREATE TABLE "Column" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "color" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "boardId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Column_pkey" PRIMARY KEY ("id")
      );
    `;
    results.push('Column table created');

    // TaskDependency table
    await prisma.$executeRaw`
      CREATE TABLE "TaskDependency" (
        "id" TEXT NOT NULL,
        "taskId" TEXT NOT NULL,
        "dependsOnId" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'finish_to_start',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("id")
      );
    `;
    results.push('TaskDependency table created');

    // TimeEntry table
    await prisma.$executeRaw`
      CREATE TABLE "TimeEntry" (
        "id" TEXT NOT NULL,
        "taskId" TEXT NOT NULL,
        "userId" TEXT,
        "hours" DOUBLE PRECISION NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "description" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
      );
    `;
    results.push('TimeEntry table created');

    // Notification table
    await prisma.$executeRaw`
      CREATE TABLE "Notification" (
        "id" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "userId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
      );
    `;
    results.push('Notification table created');

    // Create indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Memory_category_idx" ON "Memory"("category");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Memory_type_idx" ON "Memory"("type");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Project_organizationId_idx" ON "Project"("organizationId");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Task_projectId_idx" ON "Task"("projectId");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Task_assigneeId_idx" ON "Task"("assigneeId");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Risk_projectId_idx" ON "Risk"("projectId");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Workspace_organizationId_idx" ON "Workspace"("organizationId");`;
    results.push('Indexes created');

    return NextResponse.json({ 
      success: true, 
      message: 'All tables recreated successfully',
      tables: results
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error)
    }, { status: 500 });
  }
}
