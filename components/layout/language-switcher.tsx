"use client";

import { useRef, useState } from "react";
import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLocale } from "@/contexts/locale-context";
import { localeOptions } from "@/lib/translations";
import { cn } from "@/lib/utils";

function moveFocus(container: HTMLDivElement | null, direction: 1 | -1): void {
  if (!container) return;
  const items = Array.from(
    container.querySelectorAll<HTMLButtonElement>("[data-language-item]")
  );
  const currentIndex = items.findIndex((item) => item === document.activeElement);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + direction + items.length) % items.length;
  items[nextIndex]?.focus();
}

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const current = localeOptions.find((option) => option.code === locale) ?? localeOptions[0];

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={t("settings.languageLabel")}
          className="gap-2 rounded-md"
          variant="secondary"
        >
          <Languages className="h-4 w-4" />
          <span>{current.emoji}</span>
          <span>{current.short}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-44 p-2"
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            moveFocus(contentRef.current, 1);
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            moveFocus(contentRef.current, -1);
          }
        }}
      >
        <div className="grid gap-1" ref={contentRef} role="menu">
          {localeOptions.map((option) => (
            <button
              aria-checked={option.code === locale}
              key={option.code}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2 text-left text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--panel-soft)]",
                option.code === locale && "bg-[var(--panel-soft)]"
              )}
              data-language-item
              onClick={() => {
                setLocale(option.code);
                setOpen(false);
              }}
              role="menuitemradio"
              type="button"
            >
              <span>{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
