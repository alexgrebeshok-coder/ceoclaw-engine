# Российские AI-провайдеры для CEOClaw

**Создано:** 2026-03-16
**Цель:** Интеграция российских агрегаторов LLM для пользователей из РФ

---

## 🇷🇺 Провайдеры

### 1. Polza.ai ⭐ РЕКОМЕНДУЕТСЯ

**Преимущества:**
- 500+ моделей (GPT-5, Claude 4.5, Gemini 2.5, DeepSeek, Qwen)
- Дешевле конкурентов на 10-30%
- Оплата картами РФ (Visa/MC/МИР)
- Прямой доступ из РФ (без VPN)
- OpenAI-совместимый API
- Uptime: 99.5%

**Цены (₽ за 1M токенов):**

| Модель | IN | OUT | Применение |
|--------|-----|-----|------------|
| GPT-5 | 110 ₽ | 879 ₽ | Reasoning, аналитика |
| GPT-4o Mini | 13 ₽ | 53 ₽ | Чат-боты, массовые сценарии |
| Claude 4.5 Sonnet | 264 ₽ | 1,318 ₽ | Кодинг, агенты |
| Claude 4.5 Haiku | 88 ₽ | 439 ₽ | Быстрые черновики |
| DeepSeek R1 | 35 ₽ | 176 ₽ | Reasoning, математика |
| DeepSeek V3.2 Exp | 24 ₽ | 35 ₽ | Бюджетный вариант |
| Qwen3 Coder | 19 ₽ | 84 ₽ | Специализация по коду |
| Gemini 2.5 Flash | 26 ₽ | 220 ₽ | Быстрые ответы |
| Grok 4 | 264 ₽ | 1,318 ₽ | Поиск, аналитика |

**API:**
- Base URL: `https://api.polza.ai/v1`
- Auth: Bearer token
- Format: OpenAI-compatible

**Документация:** https://polza.ai/docs

---

### 2. Bothub (резерв, SLA)

**Преимущества:**
- 170+ моделей
- Корпоративные SLA, повышенные лимиты
- Приоритетная поддержка
- Российские модели (YandexGPT)
- Uptime: 99.7%

**Цены (на 15-40% выше Polza.ai):**

| Модель | IN | OUT |
|--------|-----|-----|
| GPT-5 | 188 ₽ | 1,500 ₽ |
| GPT-4o Mini | 23 ₽ | 90 ₽ |
| Claude 4.5 Sonnet | 450 ₽ | 2,250 ₽ |

**API:**
- Base URL: `https://api.bothub.chat/v1`
- Auth: Bearer token
- Format: OpenAI-compatible

**Документация:** https://bothub.chat/docs

---

### 3. YandexGPT (дополнительно)

**Преимущества:**
- Русскоязычная модель
- Интеграция с Yandex 360
- Оплата через Яндекс

**Цены:** 0.40 ₽/1K токенов

**API:** https://cloud.yandex.ru/docs/yandexgpt/

---

### 4. GigaChat (Сбер)

**Преимущества:**
- Бесплатный (персональный тариф)
- Русскоязычная модель
- Интеграция со Сбером

**API:** https://developers.sber.ru/docs/gigachat

---

## 🎯 Стратегия интеграции

### Гибридный подход:

```
70-80% трафика → Polza.ai (экономия)
20-30% трафика → Bothub (резерв, SLA)
Fallback → YandexGPT / GigaChat (российские модели)
```

### План реализации:

#### Phase 1: Polza.ai Integration (2-3 дня)

**Backend:**
- [ ] Добавить Polza.ai в `lib/ai/providers.ts`
- [ ] Создать `PolzaAIProvider` class
- [ ] Обновить `/api/ai/chat` для поддержки Polza.ai
- [ ] Добавить конфигурацию в `.env`

**Frontend:**
- [ ] Добавить Polza.ai в настройки AI
- [ ] Показывать цены в рублях
- [ ] Индикатор доступности провайдера

**API ключ:**
```
POLZA_API_KEY=pk_live_xxxxx
POLZA_BASE_URL=https://api.polza.ai/v1
```

#### Phase 2: Bothub Integration (2-3 дня)

**Backend:**
- [ ] Добавить Bothub в `lib/ai/providers.ts`
- [ ] Создать `BothubProvider` class
- [ ] Fallback logic: Polza.ai → Bothub

**Frontend:**
- [ ] Настройки Bothub
- [ ] SLA индикатор

#### Phase 3: Yandex 360 Integration (1 неделя)

**OAuth2:**
- [ ] Yandex OAuth2 авторизация
- [ ] Получение токенов
- [ ] Refresh token logic

**APIs:**
- [ ] Яндекс Почта (чтение важных писем)
- [ ] Яндекс Календарь (синхронизация событий)
- [ ] Яндекс Диск (хранение документов)

#### Phase 4: GigaChat Integration (2-3 дня)

**Backend:**
- [ ] GigaChat API integration
- [ ] Авторизация через Сбербанк ID

---

## 💰 Бюджет (оценка)

### Для 1000 запросов/день:

| Провайдер | Модель | Стоимость/день | Стоимость/месяц |
|-----------|--------|----------------|-----------------|
| Polza.ai | GPT-4o Mini | ~30 ₽ | ~900 ₽ |
| Polza.ai | Claude 4.5 Sonnet | ~200 ₽ | ~6,000 ₽ |
| Bothub | GPT-4o Mini | ~50 ₽ | ~1,500 ₽ |
| YandexGPT | Base | ~40 ₽ | ~1,200 ₽ |

**Рекомендация:** Polza.ai + GPT-4o Mini для экономии

---

## 🔧 Конфигурация

### `.env.local`:

```bash
# Polza.ai (основной)
POLZA_API_KEY=pk_live_xxxxx
POLZA_BASE_URL=https://api.polza.ai/v1

# Bothub (резерв)
BOTHUB_API_KEY=bh_live_xxxxx
BOTHUB_BASE_URL=https://api.bothub.chat/v1

# Yandex 360
YANDEX_CLIENT_ID=xxxxx
YANDEX_CLIENT_SECRET=xxxxx
YANDEX_REDIRECT_URI=http://localhost:3000/api/auth/yandex/callback

# GigaChat
GIGACHAT_API_KEY=xxxxx
GIGACHAT_SCOPE=GIGACHAT_API_PERS
```

### `lib/ai/providers.ts`:

```typescript
export const providers = {
  polza: {
    name: 'Polza.ai',
    baseUrl: process.env.POLZA_BASE_URL,
    apiKey: process.env.POLZA_API_KEY,
    currency: 'RUB',
    priority: 1,
  },
  bothub: {
    name: 'Bothub',
    baseUrl: process.env.BOTHUB_BASE_URL,
    apiKey: process.env.BOTHUB_API_KEY,
    currency: 'RUB',
    priority: 2,
  },
  // ... существующие провайдеры
};
```

---

## 📊 Метрики для отслеживания

1. **Cost per request** (₽/запрос)
2. **Latency** (ms)
3. **Error rate** (%)
4. **Uptime** (%)
5. **Token usage** (IN/OUT)

---

## 🚀 Next Steps

1. Зарегистрироваться на Polza.ai
2. Получить API ключ
3. Добавить в CEOClaw backend
4. Протестировать
5. Задеплоить

---

*Последнее обновление: 2026-03-16*
