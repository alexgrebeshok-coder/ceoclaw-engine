# CEOClaw AI Integration

## 🚀 Быстрый старт

CEOClaw AI работает **из коробки** — просто добавьте API ключи в `.env.local`.

### 1. Добавьте API ключи

```bash
# .env.local

# OpenRouter (рекомендуется — Gemini 3.1 Lite, быстро и дешево)
OPENROUTER_API_KEY="sk-or-v1-ваш-ключ"

# ИЛИ ZAI (GLM-5, российский провайдер)
ZAI_API_KEY="ваш-ключ"

# ИЛИ OpenAI (GPT-5.2)
OPENAI_API_KEY="sk-ваш-ключ"
```

### 2. Запустите

```bash
npm run dev
```

### 3. Готово!

Откройте http://localhost:3000/chat и общайтесь с AI.

---

## 🎯 Режимы работы

CEOClaw автоматически выбирает режим:

| Режим | Условие | Описание |
|-------|---------|----------|
| **Provider** | Есть API ключ | Реальные ответы от OpenRouter/ZAI/OpenAI |
| **Mock** | Нет ключей | Mock-ответы для тестирования |
| **Gateway** | OpenClaw Gateway | Подключение к локальному OpenClaw |

### Приоритет провайдеров:

1. **OpenRouter** (по умолчанию) — Gemini 3.1 Lite
2. **ZAI** — GLM-5
3. **OpenAI** — GPT-5.2

---

## 🎤 Голосовой ввод

Работает в Chrome, Safari, Edge:

1. Нажмите кнопку микрофона 🎤
2. Разрешите доступ к микрофону
3. Говорите — текст появится в поле
4. Нажмите ещё раз для остановки

**Язык:** Русский (`ru-RU`)

---

## 📎 Загрузка документов

Поддерживаемые форматы:
- Изображения: JPEG, PNG, GIF, WebP
- Документы: PDF
- Текст: TXT, CSV, JSON, Markdown

**Лимит:** 10MB на файл

---

## ⚙️ Настройка провайдеров

### OpenRouter (рекомендуется)

```bash
OPENROUTER_API_KEY="sk-or-v1-..."
DEFAULT_AI_PROVIDER="openrouter"
```

**Модели:**
- `google/gemini-3.1-flash-lite-preview` (по умолчанию)
- `deepseek/deepseek-r1:free`
- `qwen/qwen3-coder:free`

### ZAI (российский провайдер)

```bash
ZAI_API_KEY="..."
DEFAULT_AI_PROVIDER="zai"
```

**Модели:**
- `glm-5` (по умолчанию)
- `glm-4.7`
- `glm-4.7-flash`

### OpenAI

```bash
OPENAI_API_KEY="sk-..."
DEFAULT_AI_PROVIDER="openai"
```

**Модели:**
- `gpt-5.2` (по умолчанию)
- `gpt-5.1`
- `gpt-4o`

---

## 🔧 Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `OPENROUTER_API_KEY` | Ключ OpenRouter | — |
| `ZAI_API_KEY` | Ключ ZAI | — |
| `OPENAI_API_KEY` | Ключ OpenAI | — |
| `DEFAULT_AI_PROVIDER` | Провайдер по умолчанию | `openrouter` |
| `SEOCLAW_AI_MODE` | Режим: `mock`, `provider`, `gateway` | Auto-detect |
| `OPENCLAW_GATEWAY_URL` | URL OpenClaw Gateway | — |
| `OPENCLAW_GATEWAY_TOKEN` | Токен OpenClaw Gateway | — |

---

## 📊 Архитектура

```
User Input
    ↓
ChatInput.handleSubmit()
    ↓
submitPrompt() → adapter.runAgent()
    ↓
POST /api/ai/runs
    ↓
getExecutionMode() → "provider" | "mock" | "gateway"
    ↓
Provider: AIRouter.chat() → OpenRouter/ZAI/OpenAI
Mock: buildMockFinalRun()
Gateway: invokeOpenClawGateway()
    ↓
Polling: GET /api/ai/runs/[id]
    ↓
UI Update: ChatMessages
```

---

## 🧪 Тестирование

### Тест API

```bash
curl -X POST http://localhost:3000/api/ai/runs \
  -H "Content-Type: application/json" \
  -d '{
    "agent": {"id": "test", "kind": "analyst", "nameKey": "test", "accentClass": "test", "icon": "📊", "category": "strategic"},
    "prompt": "Привет!",
    "context": {
      "locale": "ru",
      "activeContext": {"type": "portfolio", "title": "Test"},
      "projects": [],
      "tasks": [],
      "team": [],
      "risks": [],
      "notifications": []
    }
  }'
```

### Тест голосового ввода

Откройте http://localhost:3000/chat в Chrome и нажмите микрофон.

---

## 📝 Примеры

### Portfolio Analyst

```typescript
// Agent: portfolio-analyst
// Prompt: "Покажи статус портфеля"
// Response: Структурированный статус с highlights и next steps
```

### Status Reporter

```typescript
// Agent: status-reporter
// Prompt: "Сгенерируй weekly update"
// Response: Draft статуса для отправки стейкхолдерам
```

---

## 🚧 Roadmap

- [ ] AI Settings page (UI для настройки провайдеров)
- [ ] Skills System (weather, research, evaluation)
- [ ] QA Agent (автотесты)
- [ ] Memory System (long-term memory в базе)
- [ ] Multi-language voice input

---

## 📚 Документация

- [ЭТАП 1: File-Based Backend](memory/2026-03-14.md#18:42)
- [ЭТАП 2: Agent Orchestrator](memory/2026-03-14.md#18:42)
- [ЭТАП 3: AI Chat Widget](memory/2026-03-14.md#20:02)
- [Voice + Attachments](memory/2026-03-14.md#20:02)

---

## 🆘 Troubleshooting

### "Provider not available"

Проверьте API ключи в `.env.local`:
```bash
grep API_KEY .env.local
```

### "Voice input not supported"

Используйте Chrome, Safari или Edge. Firefox не поддерживает Web Speech API.

### "CORS error"

Убедитесь, что dev server запущен на `localhost:3000`.

---

## 📞 Поддержка

- GitHub: https://github.com/alexgrebeshok/ceoclaw
- OpenClaw Community: https://discord.com/invite/clawd

---

**Версия:** 1.0.0
**Обновлено:** 2026-03-14
