"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface ScrollDownButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  targetId?: string;
  behavior?: ScrollBehavior;
  offsetPx?: number;
}

export function ScrollDownButton({
  className,
  targetId,
  behavior = "smooth",
  onClick,
  "aria-label": ariaLabel = "Bajar",
  ...props
}: ScrollDownButtonProps) {
  const lenisRef = React.useRef<{ scrollTo: (target: HTMLElement, options?: { offset?: number }) => void } | null>(null);

  React.useEffect(() => {
    const checkLenis = () => {
      const lenisGlobal = (window as unknown as { lenis?: { scrollTo: (target: HTMLElement, options?: { offset?: number }) => void } }).lenis;
      if (lenisGlobal) {
        lenisRef.current = lenisGlobal;
      }
    };
    checkLenis();
  }, []);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;

      if (typeof window === "undefined" || typeof document === "undefined") return;

      if (targetId) {
        const el = document.getElementById(targetId);
        if (!el) return;

        const isMobile = window.innerWidth < 768;
        const offset = isMobile ? 56 : 24;

        if (lenisRef.current) {
          lenisRef.current.scrollTo(el, { offset });
        } else {
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior,
          });
        }
        return;
      }

      window.scrollTo({ top: window.scrollY + window.innerHeight, behavior });
    },
    [behavior, onClick, targetId]
  );

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        "group inline-flex cursor-pointer items-center justify-center rounded-full p-2 transition-colors",
        "hover:bg-gradient-to/10 dark:hover:bg-primary/10",
        "outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "relative block h-10 w-6 rounded-full border",
          "border-foreground/25 dark:border-foreground/20",
          "transition-colors group-hover:border-gradient-to/55 dark:group-hover:border-primary/55"
        )}
      >
        <span
          className={cn(
            "animate-scroll-down absolute left-1/2 top-2 size-1.5 rounded-full",
            "bg-gradient-to dark:bg-primary"
          )}
        />
      </span>
    </button>
  );
}
