# AI Providers Integration Plan — CEOClaw

**Создано:** 2026-03-16
**Цель:** Единая система подключения AI-провайдеров (как в OpenClaw)

---

## 🎯 Концепция

**Flexible Auth System:**
- Нативная поддержка любого провайдера
- Multiple auth schemes (API key, OAuth2, custom)
- Hot-swap провайдеров без рестарта
- Priority-based fallback
- Russian + Global providers

---

## 🏗️ Архитектура

### Provider Interface (как в OpenClaw):

```typescript
interface AIProvider {
  name: string;
  type: 'api-key' | 'oauth2' | 'custom';
  models: string[];
  baseUrl: string;
  
  // Auth
  auth: {
    apiKey?: string;
    oauth2?: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      scopes: string[];
    };
    custom?: Record<string, any>;
  };
  
  // Methods
  chat(messages: Message[], options?: ChatOptions): Promise<string>;
  listModels(): Promise<string[]>;
  validateAuth(): Promise<boolean>;
}
```

---

## 🇷🇺 Российские провайдеры

### 1. AIJora (aijora.ru) ⭐ TOP PRIORITY

**Auth:** API Key
**Модели:** GPT-5, Grok 4, ChatGPT
**Оплата:** Карты РФ
**VPN:** Не нужен

```typescript
{
  name: 'aijora',
  type: 'api-key',
  baseUrl: 'https://api.aijora.ru/v1',
  models: ['gpt-5', 'grok-4', 'chatgpt'],
  currency: 'RUB',
  priority: 1,
}
```

### 2. Polza.ai

**Auth:** API Key
**Модели:** 500+ (GPT-5, Claude 4.5, Gemini 2.5, DeepSeek, Qwen)
**Оплата:** Карты РФ
**VPN:** Не нужен

```typescript
{
  name: 'polza',
  type: 'api-key',
  baseUrl: 'https://api.polza.ai/v1',
  models: ['gpt-5', 'gpt-4o-mini', 'claude-4.5-sonnet', 'deepseek-r1', 'qwen3-coder'],
  currency: 'RUB',
  priority: 2,
}
```

### 3. Bothub

**Auth:** API Key
**Модели:** 170+ (GPT, Claude, YandexGPT)
**Оплата:** Карты РФ
**SLA:** 99.7%

```typescript
{
  name: 'bothub',
  type: 'api-key',
  baseUrl: 'https://api.bothub.chat/v1',
  models: ['gpt-5', 'gpt-4o-mini', 'claude-4.5-sonnet', 'yandexgpt'],
  currency: 'RUB',
  priority: 3,
}
```

### 4. YandexGPT

**Auth:** OAuth2 / API Key
**Модели:** YandexGPT Pro, YandexGPT Lite
**Интеграция:** Yandex 360

```typescript
{
  name: 'yandex',
  type: 'oauth2',
  baseUrl: 'https://llm.api.cloud.yandex.net/foundationModels/v1',
  models: ['yandexgpt-pro', 'yandexgpt-lite'],
  oauth2: {
    clientId: process.env.YANDEX_CLIENT_ID,
    clientSecret: process.env.YANDEX_CLIENT_SECRET,
    redirectUri: '/api/auth/yandex/callback',
    scopes: ['ai:generate', 'ai:chat'],
  },
  currency: 'RUB',
  priority: 4,
}
```

### 5. GigaChat (Сбер)

**Auth:** OAuth2 (Сбер ID)
**Модели:** GigaChat
**Тариф:** Бесплатный (персональный)

```typescript
{
  name: 'gigachat',
  type: 'oauth2',
  baseUrl: 'https://gigachat.devices.sberbank.ru/api/v1',
  models: ['gigachat'],
  oauth2: {
    clientId: process.env.GIGACHAT_CLIENT_ID,
    clientSecret: process.env.GIGACHAT_CLIENT_SECRET,
    redirectUri: '/api/auth/gigachat/callback',
    scopes: ['GIGACHAT_API_PERS'],
  },
  currency: 'RUB',
  priority: 5,
}
```

---

## 🌍 Глобальные провайдеры

### 6. OpenRouter

**Auth:** API Key
**Модели:** 200+ (Gemini 3.1 Lite, DeepSeek, Qwen)
**Оплата:** Иностранные карты

```typescript
{
  name: 'openrouter',
  type: 'api-key',
  baseUrl: 'https://openrouter.ai/api/v1',
  models: ['google/gemini-3.1-flash-lite-preview', 'deepseek/deepseek-r1:free'],
  currency: 'USD',
  priority: 6,
}
```

### 7. ZAI

**Auth:** API Key
**Модели:** GLM-5, GLM-4.7
**Оплата:** Рубли/USD

```typescript
{
  name: 'zai',
  type: 'api-key',
  baseUrl: 'https://api.zukijourney.com/v1',
  models: ['glm-5', 'glm-4.7', 'glm-4.7-flash'],
  currency: 'USD',
  priority: 7,
}
```

### 8. OpenAI

**Auth:** API Key
**Модели:** GPT-5.2, GPT-5.1, GPT-4o
**Оплата:** Иностранные карты

```typescript
{
  name: 'openai',
  type: 'api-key',
  baseUrl: 'https://api.openai.com/v1',
  models: ['gpt-5.2', 'gpt-5.1', 'gpt-4o'],
  currency: 'USD',
  priority: 8,
}
```

---

## 🔐 Auth Schemes

### 1. API Key Auth (Simple)

```typescript
// .env
POLZA_API_KEY=pk_live_xxxxx

// Usage
const provider = new PolzaProvider(process.env.POLZA_API_KEY);
```

### 2. OAuth2 Auth (Yandex, GigaChat)

```typescript
// Step 1: Redirect to auth URL
GET /api/auth/yandex/connect
→ Redirects to Yandex OAuth page

// Step 2: Callback with code
GET /api/auth/yandex/callback?code=xxx
→ Exchange code for tokens
→ Store tokens in DB
→ Redirect to settings

// Step 3: Use tokens for API calls
const tokens = await db.getTokens(userId);
const provider = new YandexProvider(tokens.accessToken);
```

### 3. Custom Auth (Future)

```typescript
// For providers with custom auth flows
{
  name: 'custom-provider',
  type: 'custom',
  authHandler: async (config) => {
    // Custom auth logic
    return { token: 'xxx' };
  }
}
```

---

## 📊 Provider Selection Logic

```typescript
class AIRouter {
  async selectProvider(requirements: {
    model?: string;
    budget?: 'low' | 'medium' | 'high';
    region?: 'RU' | 'GLOBAL';
    priority?: 'speed' | 'quality' | 'cost';
  }): Promise<AIProvider> {
    
    // 1. Filter by region
    const available = this.providers.filter(p => {
      if (requirements.region === 'RU') {
        return ['aijora', 'polza', 'bothub', 'yandex', 'gigachat'].includes(p.name);
      }
      return true;
    });
    
    // 2. Filter by model
    if (requirements.model) {
      const withModel = available.filter(p => p.models.includes(requirements.model));
      if (withModel.length > 0) return withModel[0];
    }
    
    // 3. Sort by priority
    available.sort((a, b) => a.priority - b.priority);
    
    // 4. Check auth validity
    for (const provider of available) {
      if (await provider.validateAuth()) {
        return provider;
      }
    }
    
    throw new Error('No available providers');
  }
}
```

---

## 🚀 Implementation Plan

### Phase 1: API Key Providers (3-4 дня)

- [ ] AIJora integration
- [ ] Polza.ai integration
- [ ] Bothub integration
- [ ] OpenRouter (уже есть)
- [ ] ZAI (уже есть)
- [ ] OpenAI (уже есть)
- [ ] Provider settings UI
- [ ] API key management
- [ ] Fallback logic

### Phase 2: OAuth2 Providers (1 неделя)

- [ ] Yandex OAuth2 flow
- [ ] GigaChat OAuth2 flow
- [ ] Token storage in DB
- [ ] Token refresh logic
- [ ] OAuth UI components

### Phase 3: Provider Management (3-4 дня)

- [ ] Provider health check
- [ ] Usage statistics
- [ ] Cost tracking
- [ ] Model comparison UI
- [ ] Priority management

### Phase 4: Testing & Deploy (2-3 дня)

- [ ] Integration tests
- [ ] Load tests
- [ ] Documentation
- [ ] Deploy to Vercel
- [ ] User guide

---

## 💰 Cost Comparison (₽ за 1M токенов)

| Модель | AIJora | Polza | Bothub | OpenRouter |
|--------|--------|-------|--------|------------|
| GPT-5 | ~100 ₽ | 110 ₽ | 188 ₽ | $1.25 |
| GPT-4o Mini | ~12 ₽ | 13 ₽ | 23 ₽ | $0.15 |
| Claude 4.5 Sonnet | ~250 ₽ | 264 ₽ | 450 ₽ | $3.00 |
| DeepSeek R1 | ~35 ₽ | 35 ₽ | 60 ₽ | $0.55 |

**Рекомендация:** AIJora или Polza для экономии

---

## 🔧 Configuration

### `.env.local`:

```bash
# Российские провайдеры (приоритет)
AIJORA_API_KEY=your-aijora-key
POLZA_API_KEY=pk_live_xxxxx
BOTHUB_API_KEY=bh_live_xxxxx

# OAuth2 провайдеры
YANDEX_CLIENT_ID=xxxxx
YANDEX_CLIENT_SECRET=xxxxx
GIGACHAT_CLIENT_ID=xxxxx
GIGACHAT_CLIENT_SECRET=xxxxx

# Глобальные провайдеры
OPENROUTER_API_KEY=sk-or-v1-xxxxx
ZAI_API_KEY=xxxxx
OPENAI_API_KEY=sk-xxxxx

# Настройки
DEFAULT_AI_PROVIDER=aijora
AI_FALLBACK_ENABLED=true
AI_MAX_RETRIES=3
```

---

## 📝 API Endpoints

### Provider Management:

```
GET    /api/ai/providers              — List available providers
POST   /api/ai/providers/:name/validate — Validate API key
GET    /api/ai/providers/:name/models  — List models
GET    /api/ai/providers/:name/usage   — Usage statistics

POST   /api/ai/chat                    — Chat with auto-provider selection
POST   /api/ai/chat/:provider          — Chat with specific provider
```

### OAuth2 Flow:

```
GET    /api/auth/:provider/connect     — Start OAuth flow
GET    /api/auth/:provider/callback    — OAuth callback
DELETE /api/auth/:provider/disconnect  — Revoke tokens
```

---

## 🎯 Success Metrics

1. **Availability:** 99.5%+ (multiple providers)
2. **Latency:** <2s for chat responses
3. **Cost:** 10-30% savings vs single provider
4. **Coverage:** RF users without VPN

---

## 📚 Resources

- **AIJora:** https://www.aijora.ru/
- **Polza.ai:** https://polza.ai
- **Bothub:** https://bothub.chat
- **YandexGPT:** https://cloud.yandex.ru/docs/yandexgpt/
- **GigaChat:** https://developers.sber.ru/docs/gigachat
- **OpenRouter:** https://openrouter.ai/docs

---

*Последнее обновление: 2026-03-16*
