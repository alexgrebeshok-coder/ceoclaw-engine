"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

export function Tooltip({
  children,
  className,
  content,
  delay = 300,
}: {
  children: ReactNode;
  className?: string;
  content: ReactNode;
  delay?: number;
}) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const node = triggerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      setPosition({
        left: rect.left + rect.width / 2,
        top: rect.top - 10,
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const scheduleOpen = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setOpen(true);
    }, delay);
  };

  const hide = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(false);
  };

  return (
    <>
      <span
        aria-describedby={open ? tooltipId : undefined}
        className="inline-flex"
        onBlur={hide}
        onFocus={scheduleOpen}
        onMouseEnter={scheduleOpen}
        onMouseLeave={hide}
        ref={triggerRef}
      >
        {children}
      </span>
      {mounted
        ? createPortal(
            <div
              className={cn(
                "pointer-events-none fixed z-[90] max-w-[280px] rounded-2xl border border-[var(--line-strong)] bg-[color:var(--surface-panel)] px-3 py-2 text-left shadow-[0_24px_60px_rgba(15,23,42,.18)] transition-all duration-200",
                open
                  ? "translate-y-0 opacity-100"
                  : "translate-y-1 opacity-0",
                className
              )}
              id={tooltipId}
              role="tooltip"
              style={{
                left: position.left,
                top: position.top,
                transform: "translate(-50%, -100%)",
              }}
            >
              {content}
            </div>,
            document.body
          )
        : null}
    </>
  );
}
