"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  mode?: "fullscreen" | "contained";
  lockScroll?: boolean;
}

export function Loader({ className, mode = "fullscreen", lockScroll }: LoaderProps) {
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const shouldLockScroll = lockScroll ?? true;

  const findScrollableAncestor = React.useCallback((from: HTMLElement | null): HTMLElement | null => {
    if (!from) return null;
    let cur: HTMLElement | null = from.parentElement;
    while (cur && cur !== document.body) {
      const cs = window.getComputedStyle(cur);
      const oy = cs.overflowY;
      const o = cs.overflow;
      if (
        oy === "auto" ||
        oy === "scroll" ||
        oy === "overlay" ||
        o === "auto" ||
        o === "scroll" ||
        o === "overlay"
      ) {
        return cur;
      }
      cur = cur.parentElement;
    }
    return null;
  }, []);

  React.useEffect(() => {
    if (!shouldLockScroll) return;

    if (mode === "contained") {
      const overlay = overlayRef.current;
      if (!overlay) return;

      const container = findScrollableAncestor(overlay) ?? overlay.parentElement;
      if (!container) return;

      const prevOverflow = container.style.overflow;
      const prevOverscroll = (container.style as CSSStyleDeclaration & { overscrollBehavior?: string })
        .overscrollBehavior;

      container.style.overflow = "hidden";
      (container.style as CSSStyleDeclaration & { overscrollBehavior?: string }).overscrollBehavior =
        "none";

      const prevent = (event: Event) => {
        event.preventDefault();
      };

      // Only block scroll inside the box where the loader lives.
      overlay.addEventListener("wheel", prevent, { passive: false });
      overlay.addEventListener("touchmove", prevent, { passive: false });

      return () => {
        overlay.removeEventListener("wheel", prevent as EventListener);
        overlay.removeEventListener("touchmove", prevent as EventListener);
        container.style.overflow = prevOverflow;
        (container.style as CSSStyleDeclaration & { overscrollBehavior?: string }).overscrollBehavior =
          prevOverscroll;
      };
    }

    const html = document.documentElement;
    const body = document.body;

    const prev = {
      htmlOverflow: html.style.overflow,
      htmlOverscroll: (html.style as CSSStyleDeclaration & { overscrollBehavior?: string })
        .overscrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
    };

    const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth);

    html.style.overflow = "hidden";
    (html.style as CSSStyleDeclaration & { overscrollBehavior?: string }).overscrollBehavior = "none";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const preventScroll = (event: Event) => {
      event.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent common scroll keys while loader is shown.
      if (
        e.key === " " ||
        e.key === "PageDown" ||
        e.key === "PageUp" ||
        e.key === "Home" ||
        e.key === "End" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowUp"
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", preventScroll as EventListener);
      window.removeEventListener("touchmove", preventScroll as EventListener);
      window.removeEventListener("keydown", onKeyDown);

      html.style.overflow = prev.htmlOverflow;
      (html.style as CSSStyleDeclaration & { overscrollBehavior?: string }).overscrollBehavior =
        prev.htmlOverscroll;
      body.style.overflow = prev.bodyOverflow;
      body.style.paddingRight = prev.bodyPaddingRight;
    };
  }, [findScrollableAncestor, mode, shouldLockScroll]);

  const content = (
    <div className="flex flex-col items-center gap-8">
        <div className="relative h-32 w-32">
          <Image
            src="/logo.png"
            alt="ClinvetIA"
            width={128}
            height={128}
            className="relative z-10"
            priority
          />

          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 12 }).map((_, i) => {
              const deg = i * 30;
              const delay = i * 0.15;
              const rotateClass = `rotate-[${deg}deg]`;
              const pulseClass = `animate-[neuronPulse_2s_ease-in-out_${delay.toFixed(2)}s_infinite]`;

              return (
                <div
                  key={i}
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${rotateClass}`}
                >
                  <div className="translate-x-[60px]">
                    <div
                      className={`h-1.5 w-1.5 rounded-full bg-primary/60 dark:bg-primary ${pulseClass}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <svg className="absolute inset-0 h-full w-full scale-110" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => {
              const delay = i * 0.25;
              const animationClass = `animate-[lineOpacity_2s_ease-in-out_${delay.toFixed(2)}s_infinite]`;

              return (
                <line
                  key={i}
                  x1="50%"
                  y1="50%"
                  x2={i % 2 === 0 ? "15%" : "85%"}
                  y2={i < 2 ? "25%" : "75%"}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className={`text-primary/20 dark:text-primary/30 ${animationClass}`}
                />
              );
            })}
          </svg>
        </div>

        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-muted/30" />
          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-[spin_0.8s_linear_infinite]" />
        </div>
      </div>
  );

  return (
    <div
      ref={overlayRef}
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={cn(
        mode === "contained"
          ? "absolute inset-0 z-50 flex h-full w-full items-center justify-center"
          : "fixed inset-0 z-[9999] flex items-center justify-center",
        "bg-white/85 dark:bg-black/75",
        "supports-[backdrop-filter]:bg-white/55 dark:supports-[backdrop-filter]:bg-black/55",
        "backdrop-blur-2xl backdrop-saturate-150",
        "pointer-events-auto touch-none",
        className
      )}
    >
      {content}
    </div>
  );
}
