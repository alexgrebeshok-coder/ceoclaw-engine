/**
 * Admin API - Seed initial data for CEOClaw
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const results: string[] = [];

    // 1. Create Organization
    const org = await prisma.organization.upsert({
      where: { slug: 'default-org' },
      update: {},
      create: {
        id: 'org_default',
        slug: 'default-org',
        name: 'Моя организация',
        description: 'Организация по умолчанию',
        updatedAt: new Date(),
      },
    });
    results.push(`Organization: ${org.name}`);

    // 2. Create Workspace
    const workspace = await prisma.workspace.upsert({
      where: { id: 'ws_default' },
      update: {},
      create: {
        id: 'ws_default',
        organizationId: org.id,
        key: 'MAIN',
        name: 'Основной проект',
        initials: 'ОП',
        description: 'Рабочее пространство по умолчанию',
        isDefault: true,
        updatedAt: new Date(),
      },
    });
    results.push(`Workspace: ${workspace.name}`);

    // 3. Update User with membership (if exists)
    const existingUser = await prisma.user.findFirst();
    if (existingUser) {
      await prisma.membership.upsert({
        where: { id: 'member_default' },
        update: {},
        create: {
          id: 'member_default',
          organizationId: org.id,
          userId: existingUser.id,
          displayName: existingUser.name || 'User',
          email: existingUser.email,
          role: 'OWNER',
          updatedAt: new Date(),
        },
      });
      results.push(`Membership created for: ${existingUser.email}`);
    }

    // 4. Create Team Members
    const teamMembers = [
      { id: 'tm_1', name: 'Александр', role: 'Руководитель проекта', email: 'alex@example.com', capacity: 100 },
      { id: 'tm_2', name: 'Мария', role: 'Аналитик', email: 'maria@example.com', capacity: 80 },
      { id: 'tm_3', name: 'Дмитрий', role: 'Разработчик', email: 'dmitry@example.com', capacity: 100 },
      { id: 'tm_4', name: 'Елена', role: 'Дизайнер', email: 'elena@example.com', capacity: 60 },
    ];

    for (const tm of teamMembers) {
      await prisma.teamMember.upsert({
        where: { id: tm.id },
        update: {},
        create: {
          ...tm,
          updatedAt: new Date(),
        },
      });
    }
    results.push(`Team Members: ${teamMembers.length}`);

    // 5. Create Projects
    const projects = [
      {
        id: 'proj_1',
        name: 'ЧЭМК — Переработка дунита',
        slug: 'chemk-dunite',
        description: 'Проект по переработке дунита в Харпе, ЯНАО',
        status: 'active',
        priority: 'high',
        progress: 35,
        budget: 50000000,
        spent: 17500000,
        location: 'Харп, ЯНАО',
        organizationId: org.id,
        workspaceId: workspace.id,
      },
      {
        id: 'proj_2',
        name: 'Бентонитовые глины',
        slug: 'bentonite',
        description: 'Карьер в Казахстане → поставка в РФ',
        status: 'planning',
        priority: 'medium',
        progress: 15,
        budget: 25000000,
        spent: 3750000,
        location: 'Казахстан',
        organizationId: org.id,
        workspaceId: workspace.id,
      },
      {
        id: 'proj_3',
        name: 'CEOClaw Dashboard',
        slug: 'ceoclaw',
        description: 'AI-powered PM Dashboard',
        status: 'active',
        priority: 'high',
        progress: 70,
        budget: 5000000,
        spent: 3500000,
        location: 'Remote',
        organizationId: org.id,
        workspaceId: workspace.id,
      },
    ];

    for (const proj of projects) {
      await prisma.project.upsert({
        where: { id: proj.id },
        update: {},
        create: {
          ...proj,
          updatedAt: new Date(),
        },
      });
    }
    results.push(`Projects: ${projects.length}`);

    // 6. Create Tasks
    const tasks = [
      { id: 'task_1', title: 'Согласовать СП с ЧЭМК', status: 'in_progress', priority: 'high', progress: 50, projectId: 'proj_1' },
      { id: 'task_2', title: 'Подготовить КП для МИПТЭК', status: 'todo', priority: 'high', progress: 0, projectId: 'proj_1' },
      { id: 'task_3', title: 'Анализ рынка бентонита', status: 'done', priority: 'medium', progress: 100, projectId: 'proj_2' },
      { id: 'task_4', title: 'Интеграция AI чата', status: 'done', priority: 'high', progress: 100, projectId: 'proj_3' },
      { id: 'task_5', title: 'Telegram Bot интеграция', status: 'todo', priority: 'medium', progress: 0, projectId: 'proj_3' },
      { id: 'task_6', title: 'Мультиязычность (RU/EN/ZH)', status: 'todo', priority: 'low', progress: 0, projectId: 'proj_3' },
    ];

    for (const task of tasks) {
      await prisma.task.upsert({
        where: { id: task.id },
        update: {},
        create: {
          ...task,
          description: '',
          actualHours: 0,
          updatedAt: new Date(),
        },
      });
    }
    results.push(`Tasks: ${tasks.length}`);

    // 7. Create Risks
    const risks = [
      { id: 'risk_1', title: 'Задержка согласования СП', probability: 'high', impact: 'high', status: 'open', projectId: 'proj_1' },
      { id: 'risk_2', title: 'Изменение цен на логистику', probability: 'medium', impact: 'medium', status: 'mitigating', projectId: 'proj_2' },
      { id: 'risk_3', title: 'Блокировка Neon из РФ', probability: 'high', impact: 'low', status: 'mitigated', projectId: 'proj_3' },
    ];

    for (const risk of risks) {
      await prisma.risk.upsert({
        where: { id: risk.id },
        update: {},
        create: {
          ...risk,
          description: '',
          updatedAt: new Date(),
        },
      });
    }
    results.push(`Risks: ${risks.length}`);

    // 8. Create some initial Memory entries
    await prisma.memory.createMany({
      data: [
        {
          id: 'mem_1',
          key: 'user_name',
          value: JSON.stringify({ value: 'Саша' }),
          category: 'fact',
          type: 'long_term',
          source: 'user',
          confidence: 1,
          updatedAt: new Date(),
        },
        {
          id: 'mem_2',
          key: 'user_role',
          value: JSON.stringify({ value: 'Советник гендиректора' }),
          category: 'fact',
          type: 'long_term',
          source: 'user',
          confidence: 1,
          updatedAt: new Date(),
        },
        {
          id: 'mem_3',
          key: 'user_company',
          value: JSON.stringify({ value: 'Северавтодор' }),
          category: 'fact',
          type: 'long_term',
          source: 'user',
          confidence: 1,
          updatedAt: new Date(),
        },
      ],
      skipDuplicates: true,
    });
    results.push('Memory: Initial facts created');

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      results
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error)
    }, { status: 500 });
  }
}
