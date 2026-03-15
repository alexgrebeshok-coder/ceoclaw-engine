"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Settings, Home } from "lucide-react";
import Link from "next/link";

// ============================================
// Types
// ============================================

interface ErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
  onReload?: () => void;
  showHome?: boolean;
  showSettings?: boolean;
  variant?: "card" | "full" | "inline";
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  renderFallback?: (props: { error: Error; reset: () => void }) => ReactNode;
  resetKey?: string;
}

// ============================================
// Error Fallback Components
// ============================================

export function ErrorFallbackCard({
  error,
  onRetry,
  onReload,
  showHome = true,
  showSettings = false,
  variant = "card",
}: ErrorFallbackProps) {
  const isNetworkError =
    error.message?.includes("fetch") ||
    error.message?.includes("network") ||
    error.message?.includes("timeout");

  const isAuthError =
    error.message?.includes("401") ||
    error.message?.includes("Unauthorized") ||
    error.message?.includes("auth");

  const errorMessage = isNetworkError
    ? "Проблема с подключением к серверу"
    : isAuthError
    ? "Требуется авторизация"
    : "Что-то пошло не так";

  const errorDescription = isNetworkError
    ? "Проверьте интернет-соединение и попробуйте снова"
    : isAuthError
    ? "Войдите в систему для продолжения"
    : error.message || "Произошла непредвиденная ошибка";

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <span>{errorMessage}</span>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="ml-auto h-6 px-2"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {errorMessage}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {errorDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {onRetry && (
              <Button onClick={onRetry} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Попробовать снова
              </Button>
            )}
            {onReload && (
              <Button variant="outline" onClick={onReload} className="gap-2">
                Обновить страницу
              </Button>
            )}
            {showHome && (
              <Link href="/">
                <Button variant="ghost" className="gap-2 w-full">
                  <Home className="w-4 h-4" />
                  На главную
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default: card variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-900/50 p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {errorMessage}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {errorDescription}
          </p>
          <div className="flex flex-wrap gap-2">
            {onRetry && (
              <Button size="sm" onClick={onRetry} className="gap-2">
                <RefreshCw className="w-3 h-3" />
                Попробовать снова
              </Button>
            )}
            {onReload && (
              <Button size="sm" variant="outline" onClick={onReload}>
                Обновить страницу
              </Button>
            )}
            {showSettings && (
              <Link href="/settings">
                <Button size="sm" variant="ghost" className="gap-2">
                  <Settings className="w-3 h-3" />
                  Настройки
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Error Boundary Component
// ============================================

class ErrorBoundaryInner extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (this.props.renderFallback) {
        return this.props.renderFallback({
          error: this.state.error!,
          reset: this.handleReset,
        });
      }

      return (
        <ErrorFallbackCard
          error={this.state.error!}
          onRetry={this.handleReset}
          onReload={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================
// Public Error Boundary
// ============================================

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundaryInner {...props} />;
}

// ============================================
// AI Error Boundary
// ============================================

interface AIErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

export function AIErrorBoundary({ children, onRetry }: AIErrorBoundaryProps) {
  return (
    <ErrorBoundaryInner
      renderFallback={({ error, reset }) => (
        <AIErrorFallback
          error={error}
          onRetry={() => {
            reset();
            onRetry?.();
          }}
        />
      )}
    >
      {children}
    </ErrorBoundaryInner>
  );
}

function AIErrorFallback({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  const isProviderError =
    error.message?.includes("API key") ||
    error.message?.includes("provider") ||
    error.message?.includes("401");

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 text-center">
      <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-6 h-6 text-amber-500" />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
        AI временно недоступен
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {isProviderError
          ? "Проверьте API ключ в настройках"
          : "Произошла ошибка при обращении к AI"}
      </p>
      <div className="flex gap-2 justify-center">
        <Button size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-3 h-3" />
          Попробовать снова
        </Button>
        <Link href="/settings">
          <Button size="sm" variant="outline" className="gap-2">
            <Settings className="w-3 h-3" />
            Настройки AI
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ============================================
// API Error Boundary
// ============================================

interface APIErrorBoundaryProps {
  children: ReactNode;
  endpoint?: string;
}

export function APIErrorBoundary({
  children,
  endpoint,
}: APIErrorBoundaryProps) {
  return (
    <ErrorBoundaryInner
      renderFallback={({ error, reset }) => (
        <APIErrorFallback error={error} onRetry={reset} endpoint={endpoint} />
      )}
    >
      {children}
    </ErrorBoundaryInner>
  );
}

function APIErrorFallback({
  error,
  onRetry,
  endpoint,
}: {
  error: Error;
  onRetry: () => void;
  endpoint?: string;
}) {
  return (
    <div className="p-4">
      <ErrorFallbackCard
        error={error}
        onRetry={onRetry}
        showSettings={false}
        variant="card"
      />
      {endpoint && process.env.NODE_ENV === "development" && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Endpoint: {endpoint}
        </p>
      )}
    </div>
  );
}
