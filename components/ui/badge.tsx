import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        neutral: "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-[#252525] dark:text-[#d1d5db] dark:ring-[#343434]",
        success: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/14 dark:text-emerald-300 dark:ring-emerald-500/18",
        warning: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/14 dark:text-amber-300 dark:ring-amber-500/18",
        danger: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/14 dark:text-rose-300 dark:ring-rose-500/18",
        info: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/14 dark:text-sky-300 dark:ring-sky-500/18",
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
