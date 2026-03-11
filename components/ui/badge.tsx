import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-medium leading-none ring-1 ring-inset",
  {
    variants: {
      variant: {
        neutral:
          "bg-zinc-100 text-zinc-800 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700",
        success:
          "bg-emerald-100 text-emerald-800 ring-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:ring-emerald-500/35",
        warning:
          "bg-amber-100 text-amber-800 ring-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:ring-amber-500/35",
        danger:
          "bg-rose-100 text-rose-800 ring-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:ring-rose-500/35",
        info:
          "bg-sky-100 text-sky-800 ring-sky-300 dark:bg-sky-950/70 dark:text-sky-200 dark:ring-sky-500/35",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
