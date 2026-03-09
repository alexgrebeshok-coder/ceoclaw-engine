"use client";

import { cn } from "@/lib/utils";

export function ToggleSwitch({
  checked,
  onCheckedChange,
  ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      aria-checked={checked}
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex h-8 w-14 items-center rounded-full border transition duration-200",
        checked
          ? "border-[var(--brand)]/40 bg-[linear-gradient(135deg,var(--brand)_0%,var(--brand-strong)_100%)]"
          : "border-[var(--line)] bg-[var(--panel-soft)]"
      )}
      onClick={() => onCheckedChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={cn(
          "absolute left-1 h-6 w-6 rounded-full bg-white shadow-[0_10px_22px_rgba(15,23,42,.18)] transition-transform duration-200",
          checked && "translate-x-6"
        )}
      />
    </button>
  );
}
