"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme, type Theme } from "@/contexts/theme-context";
import { useLocale } from "@/contexts/locale-context";
import { cn } from "@/lib/utils";

const items: Array<{
  theme: Theme;
  icon: typeof Sun;
  labelKey: "theme.light" | "theme.dark" | "theme.system";
}> = [
  { theme: "light", icon: Sun, labelKey: "theme.light" },
  { theme: "dark", icon: Moon, labelKey: "theme.dark" },
  { theme: "system", icon: Monitor, labelKey: "theme.system" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();

  return (
    <div className="flex items-center gap-1 rounded-sm border border-[var(--line)] bg-[color:var(--surface-panel)] p-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = theme === item.theme;
        return (
          <Button
            key={item.theme}
            aria-label={t(item.labelKey)}
            className={cn(
              "h-8 w-8 rounded-sm px-0 shadow-none",
              active && "bg-[var(--panel-soft)]"
            )}
            onClick={() => setTheme(item.theme)}
            size="icon"
            variant={active ? "secondary" : "ghost"}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
}
