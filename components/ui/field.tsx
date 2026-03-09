import * as React from "react";

import { cn } from "@/lib/utils";

export const fieldStyles =
  "w-full rounded-md border border-[var(--line-strong)] bg-[color:var(--field)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition duration-150 placeholder:text-[var(--ink-muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[color:var(--ring)]";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldStyles, className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldStyles, "min-h-[132px] resize-y", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";
