"use client";

import { useEffect, createContext, useContext, type ReactNode } from "react";
import {
  memoryManager,
  initializeDefaultMemories,
  type MemoryEntry,
} from "@/lib/memory/memory-manager";

// ============================================
// Context
// ============================================

interface MemoryContextValue {
  get: (key: string) => MemoryEntry | null;
  getAll: (filters?: {
    type?: MemoryEntry["type"];
    category?: MemoryEntry["category"];
  }) => MemoryEntry[];
  add: (entry: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">) => MemoryEntry;
  update: (id: string, updates: Partial<MemoryEntry>) => MemoryEntry | null;
  delete: (id: string) => boolean;
  search: (query: string) => MemoryEntry[];
  getStats: () => {
    totalEntries: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    averageConfidence: number;
  };
}

const MemoryContext = createContext<MemoryContextValue | null>(null);

// ============================================
// Provider
// ============================================

export function MemoryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize default memories on first load
    initializeDefaultMemories();
  }, []);

  const value: MemoryContextValue = {
    get: memoryManager.get.bind(memoryManager),
    getAll: memoryManager.getAll.bind(memoryManager),
    add: memoryManager.add.bind(memoryManager),
    update: memoryManager.update.bind(memoryManager),
    delete: memoryManager.delete.bind(memoryManager),
    search: memoryManager.search.bind(memoryManager),
    getStats: memoryManager.getStats.bind(memoryManager),
  };

  return (
    <MemoryContext.Provider value={value}>{children}</MemoryContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useMemory() {
  const context = useContext(MemoryContext);
  
  if (!context) {
    throw new Error("useMemory must be used within MemoryProvider");
  }
  
  return context;
}
