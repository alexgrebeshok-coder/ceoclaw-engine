"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/locale-context";
import { localeOptions } from "@/lib/translations";
import { cn } from "@/lib/utils";

export function LanguageSelector() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex flex-wrap gap-2">
      {localeOptions.map((option) => {
        const active = option.code === locale;
        return (
          <Button
            className={cn("rounded-2xl", active && "shadow-[0_12px_28px_rgba(15,23,42,.1)]")}
            key={option.code}
            onClick={() => setLocale(option.code)}
            variant={active ? "secondary" : "outline"}
          >
            <span>{option.emoji}</span>
            {option.short}
          </Button>
        );
      })}
    </div>
  );
}
