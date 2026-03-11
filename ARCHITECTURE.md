# CEOClaw — Архитектура для Codex

**Проект:** CEOClaw AI operating layer
**Стек:** Next.js 15 + React 18 + TypeScript + Prisma + Tailwind
**URL:** https://ceoclaw.vercel.app
**Репозиторий:** https://github.com/alexgrebeshok-coder/ceoclaw

**Важно:** единственный канонический источник текущего execution-state и следующих сессий:
- `plans/2026-03-11-ceoclaw-master-execution-plan.md`

Поддерживающие документы:
- `plans/2026-03-11-ceoclaw-session-operating-model.md`
- `plans/2026-03-11-ceoclaw-modernization-roadmap.md`

---

## 📁 Структура проекта

```
pm-dashboard-visual-test/
├── app/                      # Next.js App Router (страницы + API)
│   ├── page.tsx             # Dashboard (главная)
│   ├── layout.tsx           # Root layout + providers
│   ├── analytics/           # Страница аналитики
│   ├── calendar/            # Календарь событий
│   ├── chat/                # AI чат
│   ├── gantt/               # Диаграмма Ганта
│   ├── help/                # Справка
│   ├── kanban/              # Канбан-доска
│   ├── projects/            # Список проектов + [id]
│   ├── risks/               # Риски
│   ├── settings/            # Настройки
│   ├── tasks/               # Задачи
│   ├── team/                # Команда
│   └── api/                 # API routes (см. ниже)
│
├── components/              # React компоненты
│   ├── ui/                  # Базовые UI компоненты (Button, Card, Dialog...)
│   ├── layout/              # Sidebar, Topbar
│   ├── dashboard/           # Dashboard виджеты
│   ├── projects/            # Компоненты проектов
│   ├── tasks/               # Компоненты задач
│   ├── kanban/              # Канбан-доска
│   ├── gantt/               # Диаграмма Ганта
│   ├── calendar/            # Календарь
│   ├── team/                # Команда
│   ├── risks/               # Риски
│   ├── analytics/           # Аналитика
│   ├── chat/                # AI чат
│   ├── notifications/       # Уведомления
│   ├── settings/            # Настройки
│   ├── ai/                  # AI компоненты
│   ├── time/                # Time tracking
│   └── help/                # Справка
│
├── contexts/                # React Contexts
│   ├── dashboard-provider.tsx   # Главное состояние (projects, tasks, team, risks)
│   ├── preferences-context.tsx  # Настройки пользователя (workspace, locale)
│   ├── theme-context.tsx        # Тема (dark/light)
│   ├── locale-context.tsx       # Локализация (ru/en/zh)
│   └── ai-context.tsx           # AI состояние
│
├── lib/                     # Библиотеки
│   ├── types.ts             # TypeScript типы (Project, Task, TeamMember, Risk...)
│   ├── mock-data.ts         # Mock данные для Vercel (без БД)
│   ├── prisma.ts            # Prisma client singleton
│   ├── utils.ts             # Утилиты (cn, formatDate...)
│   ├── dashboard-client.ts  # API клиент для фетчинга данных
│   ├── translations.ts      # Локализация (ru/en/zh)
│   ├── server/              # Server-side логика
│   │   ├── api-utils.ts     # Нормализация статусов (UI ↔ DB)
│   │   └── validators/      # Zod схемы валидации
│   ├── client/              # Client-side утилиты
│   │   └── normalizers.ts   # Нормализация данных
│   ├── hooks/               # React hooks
│   ├── ai/                  # AI логика (insights, recommendations)
│   ├── cache/               # Кеширование
│   ├── chat/                # Chat логика
│   └── __tests__/           # Unit тесты
│
├── prisma/                  # Prisma ORM
│   ├── schema.prisma        # Схема БД (SQLite локально, PostgreSQL на проде)
│   ├── seed.ts              # Seed данные
│   └── migrations/          # Миграции
│
├── tools/                   # CLI инструменты
│   └── ceoclaw-client.ts    # OpenClaw интеграция
│
├── scripts/                 # Build скрипты
├── e2e/                     # Playwright E2E тесты
├── doc/                     # Документация
│
├── package.json             # Зависимости
├── tailwind.config.ts       # Tailwind конфиг
├── tsconfig.json            # TypeScript конфиг
├── next.config.mjs          # Next.js конфиг
└── playwright.config.ts     # E2E конфиг
```

---

## 🛠 Технологии

### Frontend
- **Next.js 15.5.10** — App Router, Server Components
- **React 18** — Client Components, Context
- **TypeScript 5** — Строгая типизация
- **Tailwind CSS 3.4** — Utility-first стили
- **Radix UI** — Доступные компоненты (Dialog, Popover, Tabs)
- **Lucide React** — Иконки
- **Recharts** — Графики
- **dnd-kit** — Drag & Drop (Kanban)
- **date-fns** — Работа с датами

### Backend
- **Prisma 5.22** — ORM (SQLite dev / PostgreSQL prod)
- **Zod 4.3** — Валидация данных
- **SWR** — Data fetching

### Testing
- **Playwright** — E2E тесты
- **tsx** — Unit тесты

### Deployment
- **Vercel** — Автодеплой из GitHub
- **GitHub Actions** — (опционально)

---

## 🏗 Архитектура

### 1. App Router (Next.js 15)

**Страницы (Routes):**
- `/` — Dashboard (главная)
- `/projects` — Список проектов
- `/projects/[id]` — Детали проекта
- `/tasks` — Задачи
- `/kanban` — Канбан-доска
- `/gantt` — Диаграмма Ганта
- `/calendar` — Календарь
- `/team` — Команда
- `/risks` — Риски
- `/analytics` — Аналитика
- `/chat` — AI чат
- `/settings` — Настройки
- `/help` — Справка

**Рендеринг:**
- Static — большинство страниц (prerendered)
- Dynamic — страницы с Prisma (`export const dynamic = 'force-dynamic'`)
- Client Components — интерактивные компоненты (`"use client"`)

### 2. State Management

**DashboardProvider** (contexts/dashboard-provider.tsx):
```typescript
interface DashboardState {
  projects: Project[];
  tasks: Task[];
  team: TeamMember[];
  risks: Risk[];
  currentUser: User | null;
  notifications: NotificationItem[];
  documents: ProjectDocument[];
  milestones: Milestone[];
  auditLogEntries: AuditLogEntry[];
  isLoading: boolean;
  error: string | null;
}
```

**PreferencesContext** (contexts/preferences-context.tsx):
```typescript
interface AppPreferences {
  workspaceId: string;        // "executive" | "delivery" | "strategy"
  compactMode: boolean;
  desktopNotifications: boolean;
  soundEffects: boolean;
  emailDigest: boolean;
  aiResponseLocale: "ru" | "en" | "zh";
}
```

**Workspace Selector:**
- Executive HQ — режим для CEO (KPI, здоровье проектов)
- Delivery Office — режим для PM (задачи, сроки)
- Strategy Room — режим для аналитики

Актуально на 2026-03-11:
- workspace selector уже больше не purely decorative;
- workspace access и visibility проходят через policy model;
- execution details нужно сверять с актуальными planning docs выше.

### 3. API Routes (app/api/)

**CRUD endpoints:**
- `/api/projects` — GET (list), POST (create)
- `/api/projects/[id]` — GET, PUT, DELETE
- `/api/tasks` — GET, POST
- `/api/tasks/[id]` — GET, PUT, DELETE
- `/api/team` — GET, POST
- `/api/team/[id]` — GET, PUT, DELETE
- `/api/risks` — GET, POST
- `/api/risks/[id]` — GET, PUT, DELETE

**Специальные endpoints:**
- `/api/tasks/[id]/move` — Перемещение задачи (Kanban)
- `/api/tasks/[id]/dependencies` — Зависимости задач
- `/api/tasks/[id]/reschedule` — Перенос сроков
- `/api/tasks/reorder` — Изменение порядка
- `/api/gantt/dependencies` — Зависимости для Ганта
- `/api/calendar/events` — События календаря
- `/api/notifications` — Уведомления
- `/api/notifications/check-due-dates` — Проверка сроков

**Analytics:**
- `/api/analytics/overview` — Общая аналитика
- `/api/analytics/team-performance` — Производительность команды
- `/api/analytics/recommendations` — AI рекомендации
- `/api/analytics/predictions` — Прогнозы

**AI:**
- `/api/ai/runs` — AI runs (OpenClaw integration)
- `/api/ai/runs/[id]` — Run details
- `/api/ai/runs/[id]/proposals/[proposalId]/apply` — Apply AI proposal

**Telegram:**
- `/api/telegram/webhook` — Telegram bot webhook

**Health:**
- `/api/health` — Health check

### 4. Database (Prisma)

**Модели:**
- **Project** — Проект (status, direction, priority, health, budget, progress)
- **Task** — Задача (status, priority, dueDate, assignee, column)
- **TeamMember** — Участник (name, role, capacity)
- **Risk** — Риск (probability, impact, severity, status)
- **Milestone** — Веха (date, status)
- **Document** — Документ (filename, url, type)
- **Board** — Канбан-доска
- **Column** — Колонка канбана
- **TaskDependency** — Зависимость задач
- **TimeEntry** — Учёт времени
- **Notification** — Уведомление

**Статусы (нормализация):**

| UI (kebab-case) | DB (snake_case) |
|-----------------|-----------------|
| `on-hold`       | `on_hold`       |
| `at-risk`       | `at_risk`       |
| `in-progress`   | `in_progress`   |

**Файл нормализации:** `lib/server/api-utils.ts`

### 5. Mock Data (lib/mock-data.ts)

**Используется когда:**
- `process.env.DATABASE_URL` не задан (Vercel без БД)
- API возвращает ошибку

**Функции:**
- `getMockProjects()` — 6 проектов
- `getMockTasks()` — 11 задач
- `getMockTeam()` — 6 участников
- `getMockRisks()` — 6 рисков
- `getMockEvents()` — события календаря

---

## 📊 Типы данных (lib/types.ts)

### Project
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "planning" | "on-hold" | "completed" | "at-risk";
  progress: number;           // 0-100
  direction: "metallurgy" | "logistics" | "trade" | "construction";
  budget: { planned: number; actual: number; currency: string };
  dates: { start: string; end: string };
  nextMilestone: { name: string; date: string } | null;
  team: string[];
  risks: number;
  location: string;
  priority: "low" | "medium" | "high" | "critical";
  health: number;             // 0-100
  objectives: string[];
  materials: number;
  laborProductivity: number;
  safety: { ltifr: number; trir: number };
  history: ProgressPoint[];
}
```

### Task
```typescript
interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done" | "blocked";
  order: number;
  assignee: { id: string; name: string; initials?: string | null } | null;
  dueDate: string;
  priority: "low" | "medium" | "high" | "critical";
  tags: string[];
  createdAt: string;
  blockedReason?: string;
}
```

### TeamMember
```typescript
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  capacity: number;    // 0-100
  allocated: number;   // 0-100
  projects: string[];
  location: string;
}
```

### Risk
```typescript
interface Risk {
  id: string;
  projectId: string;
  title: string;
  owner: string;
  probability: number;  // 0-1
  impact: number;       // 0-1
  status: "open" | "mitigated" | "closed";
  mitigation: string;
  category: string;
}
```

### UserRole
```typescript
type UserRole = "EXEC" | "CURATOR" | "PM" | "MEMBER" | "SOLO";

// EXEC: Гендиректор (полный доступ)
// CURATOR: Куратор (ограниченное редактирование)
// PM: Руководитель проекта (свои проекты)
// MEMBER: Исполнитель (свои задачи)
// SOLO: Одиночка (персональное пространство)
```

---

## 🔧 Сборка и деплой

### Локальная разработка
```bash
cd /Users/aleksandrgrebeshok/CODEBASE/pm-dashboard-visual-test
npm install
npm run dev          # http://localhost:3000
```

### Build
```bash
npm run build        # prisma generate && next build
npm run lint         # ESLint
npm run test:unit    # Unit тесты
npm run test:e2e     # Playwright E2E
```

### Деплой на Vercel
```bash
vercel --prod        # Автодеплой из GitHub main branch
```

**URL:** https://ceoclaw.vercel.app

**Настройки Vercel:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Environment Variables: `DATABASE_URL` (опционально)

---

## ⚠️ Текущие проблемы

### 1. Workspace Selector не фильтрует данные
**Проблема:** Переключение workspace меняет только визуальный режим, но не фильтрует проекты/задачи.

**Решение:**
- Добавить фильтрацию по `currentUser.role` и `project.team`
- EXEC видит все проекты
- PM видит только свои проекты
- MEMBER видит только задачи где он assignee

### 2. Analytics показывает "Нет активных проектов"
**Проблема:** API `/api/analytics/overview` возвращает пустой массив `projects`.

**Исправлено:** Добавлены поля `status`, `healthScore`, `progress` в ответ API.

### 3. Нет реального пользователя
**Проблема:** `currentUser` всегда `null`, нет аутентификации.

**Решение:**
- Добавить NextAuth.js или Clerk
- Привязать данные к реальным пользователям

### 4. Mock data на Vercel
**Проблема:** Нет БД на Vercel, используются mock данные.

**Решение:**
- Подключить PostgreSQL (Vercel Postgres / Supabase / PlanetScale)
- Добавить `DATABASE_URL` в Vercel Environment Variables

### 5. Workspace Selector — декоративный элемент
**Проблема:** 3 workspace (Executive, Delivery, Strategy) не имеют функционала.

**Решение:**
- Убрать workspace selector для MVP
- Или реализовать фильтрацию данных по workspace

---

## 💡 Возможности улучшения

### Performance
1. **React Server Components** — перенести больше логики на сервер
2. **ISR (Incremental Static Regeneration)** — для страниц проектов
3. **Image Optimization** — использовать `next/image` для аватаров
4. **Bundle Analyzer** — уменьшить размер бандла

### UX/UI
1. **Skeleton Loading** — заменить спиннеры на скелетоны
2. **Optimistic Updates** — обновлять UI до ответа сервера
3. **Keyboard Shortcuts** — добавить горячие клавиши
4. **Mobile Responsive** — улучшить мобильную версию

### Features
1. **Real-time Updates** — WebSocket для синхронизации
2. **Offline Support** — Service Worker + IndexedDB
3. **Notifications** — Push уведомления
4. **Search** — Полнотекстовый поиск по проектам/задачам
5. **Export** — PDF/Excel экспорт отчётов

### Architecture
1. **Server Actions** — заменить API routes на Server Actions
2. **tRPC** — типобезопасный API
3. **Zustand** — заменить Context на Zustand для state management
4. **React Query** — заменить SWR на React Query

### AI Integration
1. **OpenClaw Integration** — встроить AI агента в дашборд
2. **AI Suggestions** — предложения по улучшению проектов
3. **Predictive Analytics** — прогнозирование рисков
4. **Natural Language Commands** — голосовое управление

### Testing
1. **Unit Tests** — покрыть lib/ тестами
2. **Integration Tests** — тестирование API routes
3. **E2E Tests** — критические сценарии (Playwright)
4. **Visual Regression** — Percy / Chromatic

### DevOps
1. **GitHub Actions** — CI/CD pipeline
2. **Preview Deployments** — деплой PR веток
3. **Monitoring** — Sentry / LogRocket
4. **Analytics** — PostHog / Plausible

---

## 📋 Приоритеты для Codex

### High Priority
1. ✅ Исправить Analytics API (возвращает пустые проекты)
2. 🔄 Реализовать фильтрацию по Workspace
3. 🔄 Добавить реального пользователя (NextAuth/Clerk)
4. 🔄 Подключить PostgreSQL к Vercel

### Medium Priority
5. Оптимизировать бандл (убрать неиспользуемые компоненты)
6. Добавить skeleton loading
7. Реализовать optimistic updates
8. Добавить keyboard shortcuts

### Low Priority
9. Server Actions вместо API routes
10. React Query вместо SWR
11. Zustand вместо Context
12. Export в PDF/Excel

---

## 🎯 Цель проекта

**CEOClaw** — AI operating layer для управления проектно-ориентированными организациями.

**Killer Features:**
- Built-in AI Agents (OpenClaw integration)
- Multi-Language (RU/EN/ZH)
- Apple-Style Design
- Context-aware AI actions
- Real-time collaboration

**Статус:** Alpha operating layer, active modernization.

---

**Файл создан:** 2026-03-10
**Автор:** Claude (OpenClaw) для Codex
