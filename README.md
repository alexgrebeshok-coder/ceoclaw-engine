# CEOClaw Dashboard

**CEOClaw** — AI-powered visual project management dashboard. Работает из коробки с AI-ассистентом.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alexgrebeshok-coder/ceoclaw)

---

## ✨ Features

### 🤖 AI-Powered
- **Voice Input** — говорите, AI понимает (Chrome, Safari, Edge)
- **File Attachments** — загружайте документы, изображения, PDF
- **Smart Context** — AI понимает контекст ваших проектов
- **Multiple Providers** — OpenRouter, ZAI, OpenAI

### 📊 Visual Management
- **Dashboard** — обзор всех проектов и метрик
- **Kanban** — drag & drop управление задачами
- **Gantt Chart** — визуализация timeline
- **Calendar** — события и дедлайны
- **Analytics** — health scores и предсказания

### 🚀 Works Out of the Box
- **Demo Mode** — работает без базы данных
- **Auto-Detect** — AI провайдер определяется автоматически
- **Onboarding** — пошаговая настройка за 2 минуты

---

## 🚀 Quick Start (5 минут)

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/alexgrebeshok-coder/ceoclaw.git
cd ceoclaw
```

### 2. Установите зависимости

```bash
npm install
```

### 3. Настройте environment

```bash
cp .env.example .env.local
```

**Минимальная настройка** (добавьте в `.env.local`):
```bash
# Добавьте один API ключ (OpenRouter рекомендуется)
OPENROUTER_API_KEY=sk-or-v1-ваш-ключ

# Demo mode - работает без БД
APP_DATA_MODE=demo
CEOCLAW_SKIP_AUTH=true
```

**Получить API ключ:**
- [OpenRouter](https://openrouter.ai/keys) — бесплатно $1, Gemini 3.1 Lite
- [ZAI](https://zai.com/) — российский AI, GLM-5
- [OpenAI](https://platform.openai.com/api-keys) — GPT-5.2

### 4. Запустите

```bash
npm run dev
```

Откройте http://localhost:3000

### 5. Готово! 🎉

- Пройдите Onboarding (2 минуты)
- Попробуйте AI чат на `/chat`
- Или нажмите кнопку AI в правом нижнем углу

---

## 📖 Режимы работы

### Demo Mode (рекомендуется для начала)

```bash
# .env.local
APP_DATA_MODE=demo
CEOCLAW_SKIP_AUTH=true
OPENROUTER_API_KEY=sk-or-v1-ваш-ключ
```

**Что работает:**
- ✅ Все 12 страниц dashboard
- ✅ AI Chat с голосовым вводом
- ✅ Mock данные (не нужна БД)
- ❌ Auth (пропущен)
- ❌ Persistence (данные в памяти)

---

### Production Mode

```bash
# .env.local
POSTGRES_PRISMA_URL=postgresql://...
NEXTAUTH_SECRET=openssl rand -base64 32
OPENROUTER_API_KEY=sk-or-v1-ваш-ключ
# Убрать APP_DATA_MODE и CEOCLAW_SKIP_AUTH
```

**Что работает:**
- ✅ Всё из Demo Mode
- ✅ PostgreSQL database
- ✅ NextAuth authentication
- ✅ Persistence данных
- ✅ Multi-user support

---

## 🤖 AI Providers

### OpenRouter (рекомендуется)

**Преимущества:**
- Бесплатно $1 на старте
- Gemini 3.1 Lite — быстро и дёшево
- 100+ моделей

**Настройка:**
```bash
OPENROUTER_API_KEY=sk-or-v1-...
DEFAULT_AI_PROVIDER=openrouter
```

**Модели:**
- `google/gemini-3.1-flash-lite-preview` (default)
- `deepseek/deepseek-r1:free`
- `qwen/qwen3-coder:free`

---

### ZAI (российский провайдер)

**Преимущества:**
- Российский AI
- GLM-5 — мощная модель
- Работает в РФ

**Настройка:**
```bash
ZAI_API_KEY=...
DEFAULT_AI_PROVIDER=zai
```

**Модели:**
- `glm-5` (default)
- `glm-4.7`
- `glm-4.7-flash`

---

### OpenAI

**Настройка:**
```bash
OPENAI_API_KEY=sk-...
DEFAULT_AI_PROVIDER=openai
```

**Модели:**
- `gpt-5.2` (default)
- `gpt-5.1`
- `gpt-4o`

---

## 📱 Использование

### AI Chat

1. Откройте `/chat` или нажмите кнопку AI 🤖
2. Введите текст или нажмите микрофон 🎤
3. Загрузите документы 📎 если нужно
4. Получите ответ от AI

### Dashboard

- **/** — Главная страница с метриками
- **/projects** — Список проектов
- **/tasks** — Задачи
- **/kanban** — Kanban-доска
- **/gantt** — Диаграмма Ганта
- **/calendar** — Календарь
- **/analytics** — Аналитика
- **/team** — Команда
- **/risks** — Риски

### Голосовой ввод

Работает в Chrome, Safari, Edge:
1. Нажмите кнопку микрофона 🎤
2. Разрешите доступ к микрофону
3. Говорите — текст появится в поле
4. Нажмите ещё раз для остановки

---

## 🛠️ Технологии

### Frontend
- **Next.js 15** — React framework
- **React 18** — UI library
- **Tailwind CSS** — Styling
- **Radix UI** — Components
- **Recharts** — Charts
- **Lucide** — Icons

### Backend
- **Next.js API Routes** — Backend
- **Prisma** — ORM
- **SQLite / PostgreSQL** — Database
- **NextAuth.js** — Authentication

### AI
- **OpenRouter** — AI provider
- **ZAI** — Russian AI provider
- **OpenAI** — AI provider
- **Web Speech API** — Voice input

---

## 📚 Документация

- [AI Integration](./README_AI.md) — настройка AI
- [API Documentation](./docs/API.md) — API endpoints
- [Deployment](./docs/DEPLOY.md) — деплой на Vercel

---

## 🚧 Roadmap

### v1.0 (Current)
- [x] AI Chat Widget
- [x] Voice Input
- [x] File Attachments
- [x] Demo Mode
- [ ] Onboarding Wizard
- [ ] Skills System
- [ ] Settings UI
- [ ] Production Deploy

### v2.0 (Next)
- [ ] QA Agent
- [ ] Memory System
- [ ] Real-time Updates
- [ ] Desktop App (Tauri)

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md).

---

## 📞 Support

- **GitHub Issues:** https://github.com/alexgrebeshok-coder/ceoclaw/issues
- **Discord:** https://discord.com/invite/clawd

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

**Made with ❤️ by [Alexander Grebeshok](https://github.com/alexgrebeshok-coder)**
