import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function HelpLink({
  href,
  label,
  description,
  className,
}: {
  href: string;
  label: string;
  description: string;
  className?: string;
}) {
  const external = href.startsWith("http") || href.startsWith("mailto:");

  const content = (
    <span
      className={cn(
        "flex items-start justify-between gap-3 rounded-[22px] border border-[var(--line)] bg-[var(--panel-soft)]/65 px-4 py-3 transition hover:border-[var(--brand)]/35 hover:bg-[var(--surface-panel-strong)]",
        className
      )}
    >
      <span className="space-y-1">
        <span className="block text-sm font-semibold text-[var(--ink)]">{label}</span>
        <span className="block text-sm text-[var(--ink-muted)]">{description}</span>
      </span>
      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
    </span>
  );

  if (external) {
    return (
      <a href={href} rel="noreferrer" target="_blank">
        {content}
      </a>
    );
  }

  return <Link href={href}>{content}</Link>;
}
