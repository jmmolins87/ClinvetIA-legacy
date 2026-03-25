"use client";

import * as React from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface CollapseProps {
  children?: React.ReactNode;
  className?: string;
}

export interface CollapseItemProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function CollapseItem({
  title,
  children,
  isOpen = false,
  onToggle,
  className,
}: CollapseItemProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card/80 backdrop-blur-sm transition-all duration-300",
        isOpen
          ? "border-primary shadow-lg"
          : "border-border hover:border-primary/50",
        className
      )}
    >
      <button
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-4 px-6 py-6 text-left transition-colors"
        aria-expanded={isOpen}
      >
        <span className="flex-1 text-base font-semibold leading-tight text-foreground sm:text-lg">
          {title}
        </span>
        <Icon
          name="ChevronDown"
          className={cn(
            "h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-6 pb-6">
          <p className="text-base leading-relaxed text-foreground/80">{children}</p>
        </div>
      </div>
    </div>
  );
}

export function Collapse({
  children,
  className,
}: CollapseProps): React.JSX.Element {
  return (
    <div className={cn("mx-auto max-w-3xl space-y-4", className)}>
      {children}
    </div>
  );
}
