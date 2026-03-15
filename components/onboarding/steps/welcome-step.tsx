"use client";

import { Bot, Sparkles, Zap, Shield } from "lucide-react";

export function WelcomeStep() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Bot className="w-10 h-10 text-white" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Добро пожаловать в CEOClaw!
      </h2>

      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        AI-powered dashboard для управления проектами.
        <br />
        Настройка займёт всего 2 минуты.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            AI Ассистент
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Голос + текст
          </div>
        </div>

        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
          <Zap className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Быстрый старт
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Работает сразу
          </div>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
          <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Безопасно
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Локальные данные
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Нажмите <strong>Далее</strong> чтобы начать настройку
      </p>
    </div>
  );
}
