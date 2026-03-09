"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "@/contexts/locale-context";

interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string;
}

interface ErrorBoundaryInnerProps extends ErrorBoundaryProps {
  renderFallback: (options: { error?: Error; reset: () => void }) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryInner extends Component<
  ErrorBoundaryInnerProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error boundary caught a render error", error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryInnerProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.handleReset();
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.renderFallback({
        error: this.state.error,
        reset: this.handleReset,
      });
    }

    return this.props.children;
  }
}

export function ErrorBoundary({ children, resetKey }: ErrorBoundaryProps) {
  const { t } = useLocale();

  return (
    <ErrorBoundaryInner
      resetKey={resetKey}
      renderFallback={({ error, reset }) => (
        <Card className="border-rose-100 bg-white/96">
          <CardContent className="flex min-h-[280px] flex-col items-center justify-center gap-5 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-semibold tracking-[-0.04em] text-rose-600">
                {t("error.title")}
              </h2>
              <p className="max-w-lg text-sm leading-6 text-[var(--ink-soft)]">
                {t("error.description")}
              </p>
              {error?.message ? (
                <p className="text-xs text-[var(--ink-muted)]">{error.message}</p>
              ) : null}
            </div>
            <Button onClick={reset}>{t("error.tryAgain")}</Button>
          </CardContent>
        </Card>
      )}
    >
      {children}
    </ErrorBoundaryInner>
  );
}
