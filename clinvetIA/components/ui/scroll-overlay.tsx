"use client";

import * as React from "react";

import { ScrollDownButton, type ScrollDownButtonProps } from "@/components/ui/scroll-down-button";
import { cn } from "@/lib/utils";
import { lockScroll } from "@/lib/scroll-lock";

type Mode = "fullscreen" | "contained";
type LockScope = "document" | "container" | false;

function findScrollableAncestor(from: HTMLElement | null): HTMLElement | null {
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
}

export interface ScrollOverlayProps extends Omit<ScrollDownButtonProps, "className"> {
  className?: string;
  mode?: Mode;
  lockScrollScope?: LockScope;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  dismissOnClick?: boolean;
}

export function ScrollOverlay({
  className,
  mode = "fullscreen",
  lockScrollScope,
  open,
  defaultOpen = true,
  onOpenChange,
  dismissOnClick = true,
  onClick,
  "aria-label": ariaLabel = "Scroll",
  ...buttonProps
}: ScrollOverlayProps) {
  const overlayRef = React.useRef<HTMLDivElement | null>(null);

  const isControlled = typeof open === "boolean";
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isOpen = isControlled ? open : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const scope: LockScope =
    typeof lockScrollScope !== "undefined"
      ? lockScrollScope
      : mode === "fullscreen"
        ? "document"
        : "container";

  React.useEffect(() => {
    if (!isOpen) return;
    if (scope === false) return;

    if (scope === "document") {
      const unlock = lockScroll();
      return () => unlock();
    }

    const overlay = overlayRef.current;
    if (!overlay) return;

    const container = findScrollableAncestor(overlay) ?? overlay.parentElement;
    if (!container) return;

    const prevOverflow = container.style.overflow;
    container.style.overflow = "hidden";

    return () => {
      container.style.overflow = prevOverflow;
    };
  }, [isOpen, scope]);

  React.useEffect(() => {
    if (!isOpen) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    const prevent = (event: Event) => {
      event.preventDefault();
    };

    // In Storybook we must not lock the whole page; this only blocks scroll
    // while the pointer is over the overlay.
    overlay.addEventListener("wheel", prevent, { passive: false });
    overlay.addEventListener("touchmove", prevent, { passive: false });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      overlay.removeEventListener("wheel", prevent as EventListener);
      overlay.removeEventListener("touchmove", prevent as EventListener);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, setOpen]);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (dismissOnClick) setOpen(false);
    },
    [dismissOnClick, onClick, setOpen]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden
      className={cn(
        "z-[9999]",
        mode === "fullscreen"
          ? "fixed inset-0 h-[100dvh] w-[100dvw]"
          : "absolute inset-0 h-full w-full",
        "bg-white/40 dark:bg-black/40",
        "backdrop-blur-xl backdrop-saturate-150",
        "overscroll-contain touch-none",
        className
      )}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div
          className={cn(
            "rounded-2xl border border-border/60",
            "bg-background/80 supports-[backdrop-filter]:bg-background/60",
            "backdrop-blur-xl backdrop-saturate-150",
            "px-5 py-4 shadow-lg"
          )}
        >
          <div className="text-center text-xs font-semibold text-muted-foreground">
            {ariaLabel}
          </div>
          <div className="mt-3 flex justify-center">
            <ScrollDownButton
              {...buttonProps}
              aria-label={ariaLabel}
              onClick={handleClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
