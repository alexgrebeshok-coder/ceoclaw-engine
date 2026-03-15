/**
 * usePersistentState - React hook for persistent state
 * 
 * Automatically persists state to localStorage and syncs across tabs.
 * 
 * @example
 * const [projects, setProjects, removeProjects] = usePersistentState<Project[]>('ceoclaw-projects', []);
 */

import { useState, useEffect, useCallback } from "react";

type SetValue<T> = (value: T | ((prevValue: T) => T)) => void;

export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>, () => void] {
  // Get initial value from localStorage
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`[usePersistentState] Error reading "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Persist to localStorage
  const setValue: SetValue<T> = useCallback(
    (value) => {
      if (typeof window === "undefined") {
        console.warn(
          `[usePersistentState] Tried setting "${key}" outside browser context`
        );
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.localStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
        
        // Dispatch custom event for same-tab sync
        window.dispatchEvent(
          new CustomEvent("persistent-storage", {
            detail: { key, value: newValue },
          })
        );
      } catch (error) {
        console.warn(`[usePersistentState] Error setting "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(
        new CustomEvent("persistent-storage", {
          detail: { key, value: null },
        })
      );
    } catch (error) {
      console.warn(`[usePersistentState] Error removing "${key}":`, error);
    }
  }, [initialValue, key]);

  // Sync across tabs (storage event)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`[usePersistentState] Error syncing "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  // Sync within same tab (custom event)
  useEffect(() => {
    const handleLocalChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value ?? initialValue);
      }
    };

    window.addEventListener(
      "persistent-storage",
      handleLocalChange as EventListener
    );
    return () =>
      window.removeEventListener(
        "persistent-storage",
        handleLocalChange as EventListener
      );
  }, [initialValue, key]);

  return [storedValue, setValue, removeValue];
}
