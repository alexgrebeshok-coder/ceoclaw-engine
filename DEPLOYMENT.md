# CEOClaw Deployment Guide

🚀 **Быстрый деплой CEOClaw на Vercel**

---

## 📋 Prerequisites

- GitHub аккаунт
- Vercel аккаунт (бесплатный)
- API ключ от OpenRouter или ZAI

---

## 🚀 Quick Deploy (5 минут)

### 1. Fork репозитория

```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/ceoclaw.git
cd ceoclaw
```

### 2. Подключите к Vercel

1. Откройте [vercel.com/new](https://vercel.com/new)
2. Нажмите **"Import Git Repository"**
3. Выберите ваш fork
4. Нажмите **"Import"**

### 3. Настройте Environment Variables

В Vercel Dashboard → Settings → Environment Variables:

**Обязательно:**

| Variable | Value | Where to get |
|----------|-------|--------------|
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | [openrouter.ai/keys](https://openrouter.ai/keys) |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Your Vercel URL |

**Опционально:**

| Variable | Value | Where to get |
|----------|-------|--------------|
| `ZAI_API_KEY` | `07b98bdc...` | [open.bigmodel.cn](https://open.bigmodel.cn/) |
| `OPENAI_API_KEY` | `sk-proj-...` | [platform.openai.com](https://platform.openai.com/api-keys) |
| `POSTGRES_URL` | `postgresql://...` | [neon.tech](https://neon.tech) |

### 4. Deploy

1. Нажмите **"Deploy"**
2. Подождите 2-3 минуты
3. Готово! 🎉

---

## 🔧 Configuration

### Demo Mode vs Production Mode

**Demo Mode** (по умолчанию):
- Работает без базы данных
- Использует mock-данные
- AI чат работает с провайдерами

**Production Mode** (с базой):
1. Создайте PostgreSQL базу (Neon, Supabase)
2. Добавьте `POSTGRES_URL` в Vercel
3. Запустите миграции:
   ```bash
   npx prisma migrate deploy
   ```
4. Установите `APP_DATA_MODE=production`

### AI Providers

CEOClaw поддерживает 3 провайдера:

1. **OpenRouter** (рекомендуется)
   - Модели: Gemini 3.1 Lite, DeepSeek R1, Qwen3
   - Pricing: $0.25/M tokens (Gemini Lite)
   - [Get API key](https://openrouter.ai/keys)

2. **ZAI** (GLM-5)
   - Модели: GLM-5, GLM-4.7
   - Pricing: $15/мес Pro
   - [Get API key](https://open.bigmodel.cn/)

3. **OpenAI** (GPT-5.2)
   - Модели: GPT-5.4, GPT-5.2, GPT-5.1
   - Pricing: Pay-per-use
   - [Get API key](https://platform.openai.com/api-keys)

### Auto-Selection Logic

CEOClaw автоматически выберет провайдера:

```
1. Check OPENROUTER_API_KEY → Use OpenRouter
2. Check ZAI_API_KEY → Use ZAI
3. Check OPENAI_API_KEY → Use OpenAI
4. Fallback → Mock mode (no AI)
```

---

## 🧪 Testing Deployment

### Health Check

```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "checks": {
    "ai": {"status": "ok", "provider": "openrouter"},
    "storage": {"status": "ok"}
  }
}
```

### AI Chat Test

```bash
curl -X POST https://your-app.vercel.app/api/ai/runs \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Привет!"}'
```

Expected response:
```json
{
  "id": "ai-run-...",
  "status": "done",
  "result": {"summary": "Привет! Чем могу помочь?"}
}
```

---

## 🔐 Security Headers

CEOClaw автоматически добавляет security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

---

## 📊 Monitoring

### Vercel Analytics

1. Vercel Dashboard → Analytics
2. Enable **Web Analytics**
3. Enable **Speed Insights**

### Error Tracking (optional)

1. Создайте проект на [sentry.io](https://sentry.io)
2. Добавьте `NEXT_PUBLIC_SENTRY_DSN` в Vercel
3. Errors будут автоматически отправляться

---

## 🔄 Updates

### Auto-Deploy

Vercel автоматически задеплоит изменения при push в `main`:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Deploy

```bash
vercel --prod
```

---

## 🐛 Troubleshooting

### Build Failed

1. Проверьте `package.json` — нет ли ошибок
2. Запустите локально: `npm run build`
3. Проверьте логи в Vercel Dashboard

### AI Not Working

1. Проверьте API ключ в Vercel
2. Проверьте `/api/health` endpoint
3. Проверьте баланс API ключа

### Database Connection Failed

1. Проверьте `POSTGRES_URL`
2. Убедитесь что база не "спит" (Neon free tier)
3. Проверьте логи Prisma

---

## 📱 Custom Domain

1. Vercel Dashboard → Settings → Domains
2. Добавьте ваш домен
3. Настройте DNS записи
4. Обновите `NEXT_PUBLIC_APP_URL`

---

## 🎯 Production Checklist

- [ ] API ключи добавлены в Vercel
- [ ] `NEXT_PUBLIC_APP_URL` установлен
- [ ] Health check возвращает `ok`
- [ ] AI чат отвечает
- [ ] Custom domain настроен (optional)
- [ ] Analytics включены (optional)
- [ ] Error tracking настроен (optional)

---

## 🆘 Support

- **Docs:** [docs.openclaw.ai](https://docs.openclaw.ai)
- **Discord:** [discord.gg/clawd](https://discord.gg/clawd)
- **GitHub Issues:** [github.com/openclaw/ceoclaw/issues](https://github.com/openclaw/ceoclaw/issues)

---

**Удачи с деплоем! 🚀**
