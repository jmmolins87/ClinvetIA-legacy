/**
 * FocusTrap Component
 *
 * Traps focus within a container element for improved accessibility.
 * Essential for modal dialogs and overlays.
 */

"use client";

import * as React from "react";

export interface FocusTrapProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export function FocusTrap({ children, enabled = true }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const getFocusableElements = () => {
      return container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="dialog"]'
      );
    };

    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (focusableElements.length === 0) return;

      if (e.shiftKey && (document.activeElement === firstElement || document.activeElement === container)) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    // Focus first element when mounted
    if (firstElement) {
      setTimeout(() => {
        firstElement.focus();
      }, 0);
    }

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);

  return (
    <div ref={containerRef} data-focus-trap="true">
      {children}
    </div>
  );
}
