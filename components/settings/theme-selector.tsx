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

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        const active = theme === item.theme;
        return (
          <Button
            className={cn("justify-start rounded-2xl", active && "shadow-[0_12px_28px_rgba(15,23,42,.1)]")}
            key={item.theme}
            onClick={() => setTheme(item.theme)}
            variant={active ? "secondary" : "outline"}
          >
            <Icon className="h-4 w-4" />
            {t(item.labelKey)}
          </Button>
        );
      })}
    </div>
  );
}
