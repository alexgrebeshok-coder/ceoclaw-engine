"use client";

import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ClientChart({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn("min-h-0 min-w-0", className)}>
      {mounted ? (
        children
      ) : (
        <div className="h-full w-full rounded-[24px] bg-[var(--panel-soft)]/80" />
      )}
    </div>
  );
}
