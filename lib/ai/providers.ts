/**
 * AI Providers - Multi-provider support
 * OpenRouter + ZAI + OpenAI
 */

// ============================================
// Types
// ============================================

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  name: string;
  models: string[];
  chat(messages: Message[], options?: ChatOptions): Promise<string>;
}

// ============================================
// OpenRouter Provider
// ============================================

export class OpenRouterProvider implements AIProvider {
  name = 'openrouter';
  models = [
    'google/gemini-3.1-flash-lite-preview',
    'deepseek/deepseek-r1:free',
    'qwen/qwen3-coder:free',
  ];

  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY not set');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ceoclaw.com',
        'X-Title': 'CEOClaw',
      },
      body: JSON.stringify({
        model: options?.model || this.models[0],
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// ============================================
// ZAI Provider
// ============================================

export class ZAIProvider implements AIProvider {
  name = 'zai';
  models = ['glm-5', 'glm-4.7', 'glm-4.7-flash'];

  private apiKey: string;
  private baseUrl = 'https://api.zukijourney.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ZAI_API_KEY || '';
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('ZAI_API_KEY not set');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model || 'glm-5',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ZAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// ============================================
// OpenAI Provider
// ============================================

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  models = ['gpt-5.2', 'gpt-5.1', 'gpt-4o'];

  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY not set');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-5.2',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// ============================================
// AIJora Provider (Российский агрегатор)
// ============================================

export class AIJoraProvider implements AIProvider {
  name = 'aijora';
  models = [
    'gpt-5',
    'grok-4',
    'chatgpt',
    // TODO: Уточнить список моделей на https://www.aijora.ru/
  ];

  private apiKey: string;
  private baseUrl = 'https://api.aijora.ru/v1'; // TODO: Уточнить endpoint

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.AIJORA_API_KEY || '';
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('AIJORA_API_KEY not set');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-5',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AIJora API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// ============================================
// Polza.ai Provider (Российский агрегатор)
// ============================================

export class PolzaProvider implements AIProvider {
  name = 'polza';
  models = [
    'gpt-5',
    'gpt-4o-mini',
    'claude-4.5-sonnet',
    'claude-4.5-haiku',
    'deepseek-r1',
    'deepseek-v3.2-exp',
    'qwen3-coder',
    'gemini-2.5-flash',
  ];

  private apiKey: string;
  private baseUrl = 'https://api.polza.ai/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.POLZA_API_KEY || '';
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('POLZA_API_KEY not set');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4o-mini',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Polza.ai API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// ============================================
// Bothub Provider (Российский агрегатор)
// ============================================

export class BothubProvider implements AIProvider {
  name = 'bothub';
  models = [
    'gpt-5',
    'gpt-4o-mini',
    'claude-4.5-sonnet',
    'deepseek-r1',
    'qwen3-coder',
    'yandexgpt',
  ];

  private apiKey: string;
  private baseUrl = 'https://api.bothub.chat/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BOTHUB_API_KEY || '';
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('BOTHUB_API_KEY not set');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4o-mini',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Bothub API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// ============================================
// AI Router
// ============================================

export class AIRouter {
  private providers: Map<string, AIProvider> = new Map();
  private defaultProvider = 'openrouter';
  private providerPriority: string[] = ['aijora', 'polza', 'openrouter', 'bothub', 'zai', 'openai'];

  constructor() {
    // Initialize providers from env (in priority order)
    if (process.env.AIJORA_API_KEY) {
      this.providers.set('aijora', new AIJoraProvider());
    }

    if (process.env.POLZA_API_KEY) {
      this.providers.set('polza', new PolzaProvider());
    }

    if (process.env.OPENROUTER_API_KEY) {
      this.providers.set('openrouter', new OpenRouterProvider());
    }

    if (process.env.BOTHUB_API_KEY) {
      this.providers.set('bothub', new BothubProvider());
    }

    if (process.env.ZAI_API_KEY) {
      this.providers.set('zai', new ZAIProvider());
    }

    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAIProvider());
    }

    // Set default provider (highest priority available)
    if (process.env.DEFAULT_AI_PROVIDER) {
      this.defaultProvider = process.env.DEFAULT_AI_PROVIDER;
    } else {
      // Use first available from priority list
      for (const provider of this.providerPriority) {
        if (this.providers.has(provider)) {
          this.defaultProvider = provider;
          break;
        }
      }
    }
  }

  /**
   * Chat with AI
   */
  async chat(
    messages: Message[],
    options: { provider?: string; model?: string } = {}
  ): Promise<string> {
    const providerName = options.provider || this.defaultProvider;
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(
        `Provider ${providerName} not available. Check API keys in .env`
      );
    }

    return provider.chat(messages, options);
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get available models
   */
  getAvailableModels(): { provider: string; model: string }[] {
    const models: { provider: string; model: string }[] = [];

    for (const [name, provider] of this.providers) {
      for (const model of provider.models) {
        models.push({ provider: name, model });
      }
    }

    return models;
  }

  /**
   * Check if provider is available
   */
  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }
}

// ============================================
// Helper Functions for Health Check
// ============================================

let _routerInstance: AIRouter | null = null;

function getRouter(): AIRouter {
  if (!_routerInstance) {
    _routerInstance = new AIRouter();
  }
  return _routerInstance;
}

/**
 * Check if any AI provider is available
 */
export async function hasAvailableProvider(): Promise<boolean> {
  try {
    const router = getRouter();
    const providers = router.getAvailableProviders();
    return providers.length > 0;
  } catch (error) {
    console.error("[AI] Error checking providers:", error);
    return false;
  }
}

/**
 * Get the default provider name
 */
export function getProviderName(): string | null {
  try {
    const router = getRouter();
    const providers = router.getAvailableProviders();
    
    if (providers.length === 0) return null;
    
    // Return default provider if set
    if (process.env.DEFAULT_AI_PROVIDER && providers.includes(process.env.DEFAULT_AI_PROVIDER)) {
      return process.env.DEFAULT_AI_PROVIDER;
    }
    
    // Otherwise return first available
    return providers[0];
  } catch (error) {
    console.error("[AI] Error getting provider name:", error);
    return null;
  }
}

// Export singleton instance
export const aiRouter = getRouter();
