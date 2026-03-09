import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-[var(--surface)]",
  {
    variants: {
      variant: {
        default:
          "border-[var(--brand)] bg-[var(--brand)] text-white hover:border-[var(--brand-strong)] hover:bg-[var(--brand-strong)]",
        secondary:
          "border-[var(--line-strong)] bg-[var(--panel-soft)] text-[var(--ink)] hover:bg-[color:var(--surface-panel-strong)]",
        ghost: "text-[var(--ink-soft)] hover:bg-[var(--panel-soft)] hover:text-[var(--ink)]",
        outline:
          "border-[var(--line-strong)] bg-[color:var(--surface-panel)] text-[var(--ink)] hover:border-[var(--line-strong)] hover:bg-[var(--panel-soft)]",
        danger:
          "border-[#ef4444] bg-[#ef4444] text-white hover:border-[#dc2626] hover:bg-[#dc2626]",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-sm px-3 text-xs",
        lg: "h-11 rounded-md px-5 text-sm",
        icon: "h-10 w-10 rounded-md px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      type={type}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button };
