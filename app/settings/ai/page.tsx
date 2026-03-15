"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { browserStorage, STORAGE_KEYS } from "@/lib/persistence/storage";

// ============================================
// Types
// ============================================

interface AISettings {
  provider: "openrouter" | "zai" | "openai";
  openrouterKey: string;
  zaiKey: string;
  openaiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

const DEFAULT_SETTINGS: AISettings = {
  provider: "openrouter",
  openrouterKey: "",
  zaiKey: "",
  openaiKey: "",
  model: "google/gemini-3.1-flash-lite-preview",
  temperature: 0.7,
  maxTokens: 4096,
};

const PROVIDER_MODELS: Record<string, string[]> = {
  openrouter: [
    "google/gemini-3.1-flash-lite-preview",
    "google/gemini-2.5-flash-lite",
    "deepseek/deepseek-r1:free",
    "qwen/qwen3-coder:free",
  ],
  zai: ["glm-5", "glm-4.7", "glm-4.7-flash"],
  openai: ["gpt-5.4", "gpt-5.2", "gpt-5.1"],
};

// ============================================
// Component
// ============================================

export default function AISettingsPage() {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "error" | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings
  useEffect(() => {
    const saved = browserStorage.get<AISettings>(STORAGE_KEYS.AI_SETTINGS);
    if (saved) {
      setSettings({ ...DEFAULT_SETTINGS, ...saved });
    }
  }, []);

  // Check for changes
  useEffect(() => {
    const saved = browserStorage.get<AISettings>(STORAGE_KEYS.AI_SETTINGS);
    const current = JSON.stringify(settings);
    const original = JSON.stringify(saved || DEFAULT_SETTINGS);
    setHasChanges(current !== original);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      browserStorage.set(STORAGE_KEYS.AI_SETTINGS, settings);
      setHasChanges(false);
      setTimeout(() => setSaving(false), 500);
    } catch (error) {
      console.error("[Settings] Error saving:", error);
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    browserStorage.remove(STORAGE_KEYS.AI_SETTINGS);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/health");
      const data = await res.json();

      if (data.checks?.ai?.available) {
        setTestResult("ok");
      } else {
        setTestResult("error");
      }
    } catch (error) {
      setTestResult("error");
    } finally {
      setTesting(false);
    }
  };

  const toggleShowKey = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSetting = <K extends keyof AISettings>(
    key: K,
    value: AISettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const currentKey = (() => {
    switch (settings.provider) {
      case "openrouter":
        return settings.openrouterKey;
      case "zai":
        return settings.zaiKey;
      case "openai":
        return settings.openaiKey;
      default:
        return "";
    }
  })();

  const isConfigured = currentKey.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Настройки AI
            </h1>
            <p className="text-sm text-gray-500">Подключение AI провайдеров</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Статус подключения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isConfigured ? (
                  <>
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Настроен
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Провайдер: {settings.provider}
                    </span>
                  </>
                ) : (
                  <Badge variant="info">
                    <XCircle className="w-3 h-3 mr-1" />
                    Не настроен
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={testing || !isConfigured}
              >
                {testing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : testResult === "ok" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : testResult === "error" ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : (
                  "Проверить"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Provider Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Провайдер</CardTitle>
            <CardDescription>
              Выберите AI провайдера и введите API ключ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Provider Select */}
            <div className="space-y-2">
              <Label>Провайдер</Label>
              <Select
                value={settings.provider}
                onValueChange={(v) => updateSetting("provider", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openrouter">
                    OpenRouter (рекомендуется)
                  </SelectItem>
                  <SelectItem value="zai">ZAI</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Model Select */}
            <div className="space-y-2">
              <Label>Модель</Label>
              <Select
                value={settings.model}
                onValueChange={(v) => updateSetting("model", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_MODELS[settings.provider]?.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* API Keys */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">API Ключи</h4>

              {/* OpenRouter */}
              <div className="space-y-2">
                <Label
                  htmlFor="openrouter-key"
                  className="flex items-center gap-2"
                >
                  OpenRouter API Key
                  {settings.provider === "openrouter" && (
                    <Badge variant="info" className="text-xs">
                      активный
                    </Badge>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="openrouter-key"
                    type={showKeys.openrouter ? "text" : "password"}
                    placeholder="sk-or-..."
                    value={settings.openrouterKey}
                    onChange={(e) =>
                      updateSetting("openrouterKey", e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleShowKey("openrouter")}
                  >
                    {showKeys.openrouter ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Получите ключ на{" "}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    openrouter.ai/keys
                  </a>
                </p>
              </div>

              {/* ZAI */}
              <div className="space-y-2">
                <Label htmlFor="zai-key" className="flex items-center gap-2">
                  ZAI API Key
                  {settings.provider === "zai" && (
                    <Badge variant="info" className="text-xs">
                      активный
                    </Badge>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="zai-key"
                    type={showKeys.zai ? "text" : "password"}
                    placeholder="zai-..."
                    value={settings.zaiKey}
                    onChange={(e) => updateSetting("zaiKey", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleShowKey("zai")}
                  >
                    {showKeys.zai ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* OpenAI */}
              <div className="space-y-2">
                <Label htmlFor="openai-key" className="flex items-center gap-2">
                  OpenAI API Key
                  {settings.provider === "openai" && (
                    <Badge variant="info" className="text-xs">
                      активный
                    </Badge>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="openai-key"
                    type={showKeys.openai ? "text" : "password"}
                    placeholder="sk-..."
                    value={settings.openaiKey}
                    onChange={(e) => updateSetting("openaiKey", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleShowKey("openai")}
                  >
                    {showKeys.openai ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Расширенные настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Temperature: {settings.temperature}</Label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={(e) =>
                  updateSetting("temperature", parseFloat(e.target.value))
                }
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Низкие значения = более точные ответы, высокие = более
                креативные
              </p>
            </div>

            <div className="space-y-2">
              <Label>Max Tokens: {settings.maxTokens}</Label>
              <input
                type="range"
                min="256"
                max="8192"
                step="256"
                value={settings.maxTokens}
                onChange={(e) =>
                  updateSetting("maxTokens", parseInt(e.target.value))
                }
                className="w-full"
              />
              <p className="text-xs text-gray-500">Максимальная длина ответа</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Сбросить
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Сохранить
          </Button>
        </div>
      </main>
    </div>
  );
}
