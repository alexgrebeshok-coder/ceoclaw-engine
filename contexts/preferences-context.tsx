"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { readClientAccessProfile, type AccessProfile } from "@/lib/auth/access-profile";
import {
  getAvailableWorkspacesForRole,
  resolveAccessibleWorkspace,
  type PolicyWorkspaceOption,
} from "@/lib/policy/access";
import type { Locale, MessageKey } from "@/lib/translations";

export const PREFERENCES_STORAGE_KEY = "ceoclaw-settings";

export type WorkspaceOption = PolicyWorkspaceOption & {
  nameKey: MessageKey;
  descriptionKey: MessageKey;
};

export interface AppPreferences {
  workspaceId: string;
  compactMode: boolean;
  desktopNotifications: boolean;
  soundEffects: boolean;
  emailDigest: boolean;
  aiResponseLocale: Locale;
}

interface PreferencesContextValue {
  accessProfile: AccessProfile;
  preferences: AppPreferences;
  availableWorkspaces: WorkspaceOption[];
  activeWorkspace: WorkspaceOption;
  setWorkspaceId: (workspaceId: string) => void;
  setCompactMode: (compactMode: boolean) => void;
  setDesktopNotifications: (enabled: boolean) => void;
  setSoundEffects: (enabled: boolean) => void;
  setEmailDigest: (enabled: boolean) => void;
  setAiResponseLocale: (locale: Locale) => void;
}

const defaultPreferences: AppPreferences = {
  workspaceId: "delivery",
  compactMode: true,
  desktopNotifications: true,
  soundEffects: false,
  emailDigest: true,
  aiResponseLocale: "ru",
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function isLocale(value: unknown): value is Locale {
  return value === "ru" || value === "en" || value === "zh";
}

function normalizePreferences(
  raw: unknown,
  availableWorkspaces: WorkspaceOption[],
  fallbackWorkspaceId: string
): AppPreferences {
  if (!raw || typeof raw !== "object") {
    return { ...defaultPreferences, workspaceId: fallbackWorkspaceId };
  }

  const candidate = raw as Partial<AppPreferences>;
  const workspaceId =
    typeof candidate.workspaceId === "string" &&
    availableWorkspaces.some((item) => item.id === candidate.workspaceId)
      ? candidate.workspaceId
      : fallbackWorkspaceId;

  return {
    workspaceId,
    compactMode: Boolean(candidate.compactMode),
    desktopNotifications:
      typeof candidate.desktopNotifications === "boolean"
        ? candidate.desktopNotifications
        : defaultPreferences.desktopNotifications,
    soundEffects:
      typeof candidate.soundEffects === "boolean"
        ? candidate.soundEffects
        : defaultPreferences.soundEffects,
    emailDigest:
      typeof candidate.emailDigest === "boolean"
        ? candidate.emailDigest
        : defaultPreferences.emailDigest,
    aiResponseLocale: isLocale(candidate.aiResponseLocale)
      ? candidate.aiResponseLocale
      : defaultPreferences.aiResponseLocale,
  };
}

function applyDensity(compactMode: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.density = compactMode ? "compact" : "comfortable";
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [accessProfile, setAccessProfile] = useState<AccessProfile>(() => readClientAccessProfile());
  const [preferences, setPreferences] = useState<AppPreferences>(() => ({
    ...defaultPreferences,
    workspaceId: resolveAccessibleWorkspace(readClientAccessProfile().role, "delivery").id,
  }));
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const nextAccessProfile = readClientAccessProfile();
      const nextAvailableWorkspaces = getAvailableWorkspacesForRole(nextAccessProfile.role);
      const fallbackWorkspaceId = resolveAccessibleWorkspace(
        nextAccessProfile.role,
        nextAccessProfile.workspaceId
      ).id;
      const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      const nextPreferences = raw
        ? normalizePreferences(JSON.parse(raw), nextAvailableWorkspaces, fallbackWorkspaceId)
        : { ...defaultPreferences, workspaceId: fallbackWorkspaceId };
      setAccessProfile(nextAccessProfile);
      setPreferences(nextPreferences);
      applyDensity(nextPreferences.compactMode);
    } catch {
      applyDensity(defaultPreferences.compactMode);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    applyDensity(preferences.compactMode);
    if (!isReady) return;

    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // ignore storage failures
    }
  }, [isReady, preferences]);

  const value = useMemo<PreferencesContextValue>(() => {
    const availableWorkspaces = getAvailableWorkspacesForRole(accessProfile.role);
    const activeWorkspace =
      availableWorkspaces.find((item) => item.id === preferences.workspaceId) ??
      availableWorkspaces[0];

    return {
      accessProfile,
      preferences,
      availableWorkspaces,
      activeWorkspace,
      setWorkspaceId: (workspaceId) => {
        if (!availableWorkspaces.some((item) => item.id === workspaceId)) return;
        setPreferences((current) => ({ ...current, workspaceId }));
      },
      setCompactMode: (compactMode) => {
        setPreferences((current) => ({ ...current, compactMode }));
      },
      setDesktopNotifications: (desktopNotifications) => {
        setPreferences((current) => ({ ...current, desktopNotifications }));
      },
      setSoundEffects: (soundEffects) => {
        setPreferences((current) => ({ ...current, soundEffects }));
      },
      setEmailDigest: (emailDigest) => {
        setPreferences((current) => ({ ...current, emailDigest }));
      },
      setAiResponseLocale: (aiResponseLocale) => {
        setPreferences((current) => ({ ...current, aiResponseLocale }));
      },
    };
  }, [accessProfile, preferences]);

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }

  return context;
}
