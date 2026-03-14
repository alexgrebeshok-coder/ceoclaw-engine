/**
 * Worker Agents - Specialized agents for different tasks
 */

import { BaseAgent, AgentContext, AgentResult } from './base-agent';

// ============================================
// Main Worker - Execution agent
// ============================================

export class WorkerAgent extends BaseAgent {
  id = 'main-worker';
  name = 'Worker';
  role = 'Execution';
  description = 'Выполняет действия (exec, write, edit)';

  constructor() {
    super({ model: 'glm-5', provider: 'zai' });
  }

  async execute(task: string, context?: AgentContext): Promise<AgentResult> {
    const systemPrompt = `Ты Worker Agent — исполнитель CEOClaw.

Твоя роль:
- Выполнять конкретные действия
- Генерировать код, команды, файлы
- Вносить изменения

Действия:
- exec: запуск shell команд
- write: создание файлов
- edit: редактирование файлов

Контекст:
${JSON.stringify(context, null, 2)}

Отвечай кратко и по делу. Если нужен код — пиши код.`;

    try {
      const response = await this.chat(systemPrompt, task);
      return { success: true, content: response };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// ============================================
// Research Agent - Fast web search
// ============================================

export class ResearchAgent extends BaseAgent {
  id = 'quick-research';
  name = 'Research';
  role = 'Research, web поиск';
  description = 'Быстрый поиск информации (в 3.5x быстрее)';

  constructor() {
    super({ model: 'gemini-3.1-flash-lite-preview', provider: 'openrouter' });
  }

  async execute(task: string, context?: AgentContext): Promise<AgentResult> {
    const systemPrompt = `Ты Research Agent — исследователь CEOClaw.

Твоя роль:
- Искать информацию в интернете
- Анализировать источники
- Составлять отчёты

Модель: Gemini 3.1 Lite (в 3.5x быстрее).

Контекст:
${JSON.stringify(context, null, 2)}

Формат ответа:
## 🔍 Результаты поиска
- ...

## 📊 Анализ
- ...

## 💡 Выводы
- ...`;

    try {
      const response = await this.chat(systemPrompt, task);
      return { success: true, content: response };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// ============================================
// Coder Agent - Code generation
// ============================================

export class CoderAgent extends BaseAgent {
  id = 'quick-coder';
  name = 'Coder';
  role = 'Генерация кода';
  description = 'Генерация и рефакторинг кода';

  constructor() {
    super({ model: 'glm-5', provider: 'zai' });
  }

  async execute(task: string, context?: AgentContext): Promise<AgentResult> {
    const systemPrompt = `Ты Coder Agent — генератор кода CEOClaw.

Твоя роль:
- Генерировать код (TypeScript, Python, etc.)
- Рефакторить существующий код
- Оптимизировать производительность
- Писать тесты

Стиль кода:
- Clean Code
- DRY (Don't Repeat Yourself)
- SOLID principles
- TypeScript strict mode

Контекст:
${JSON.stringify(context, null, 2)}

Пиши только код, без лишних объяснений. Комментарии — только если необходимо.`;

    try {
      const response = await this.chat(systemPrompt, task);
      return { success: true, content: response };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// ============================================
// Writer Agent - Documentation
// ============================================

export class WriterAgent extends BaseAgent {
  id = 'writer';
  name = 'Writer';
  role = 'Тексты, документация';
  description = 'Написание текстов и документации';

  constructor() {
    super({ model: 'glm-5', provider: 'zai' });
  }

  async execute(task: string, context?: AgentContext): Promise<AgentResult> {
    const systemPrompt = `Ты Writer Agent — писатель CEOClaw.

Твоя роль:
- Писать документацию (README, API docs)
- Создавать отчёты и презентации
- Редактировать тексты
- Переводить (RU/EN/ZH)

Стиль:
- Чёткий и лаконичный
- Структурированный
- Professional tone

Контекст:
${JSON.stringify(context, null, 2)}

Формат: Markdown.`;

    try {
      const response = await this.chat(systemPrompt, task);
      return { success: true, content: response };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// ============================================
// Planner Agent - Planning and decomposition
// ============================================

export class PlannerAgent extends BaseAgent {
  id = 'planner';
  name = 'Planner';
  role = 'Планирование задач';
  description = 'Планирование и декомпозиция задач';

  constructor() {
    super({ model: 'glm-5', provider: 'zai' });
  }

  async execute(task: string, context?: AgentContext): Promise<AgentResult> {
    const systemPrompt = `Ты Planner Agent — планировщик CEOClaw.

Твоя роль:
- Декомпозировать сложные задачи
- Создавать планы и roadmaps
- Оценивать сроки и ресурсы
- Выявлять риски

Контекст:
${JSON.stringify(context, null, 2)}

Формат ответа:
## 📋 План
1. [Задача 1] — время, приоритет
2. [Задача 2] — время, приоритет
...

## ⚠️ Риски
- ...

## ✅ Критерии готовности
- ...`;

    try {
      const response = await this.chat(systemPrompt, task);
      return { success: true, content: response };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// ============================================
// Reviewer Agent - QA and quality check
// ============================================


// ============================================
// Reviewer Agent - QA and quality check
// ============================================

export class ReviewerAgent extends BaseAgent {
  id = 'main-reviewer';
  name = 'Reviewer';
  role = 'QA, проверка качества';
  description = 'Критика, проверка качества, code review';

  constructor() {
    super({ model: 'gpt-5.2', provider: 'openai' });
  }

  async execute(task: string, context?: AgentContext): Promise<AgentResult> {
    const systemPrompt = `Ты Reviewer Agent — критик CEOClaw.

Твоя роль:
- Критически оценивать результаты
- Находить ошибки и проблемы
- Проверять качество кода
- Предлагать улучшения

Будь строг, но конструктивен. Модель: GPT-5.2 (высокое качество).

Контекст:
${JSON.stringify(context, null, 2)}

Формат ответа:
## 🔍 Анализ
- ...

## ⚠️ Проблемы (CRITICAL)
- ...

## 💡 Улучшения (NICE-TO-HAVE)
- ...

## ✅ Вердикт
APPROVE / REQUEST_CHANGES / REJECT`;

    try {
      const response = await this.chat(systemPrompt, task);
      return { success: true, content: response };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
