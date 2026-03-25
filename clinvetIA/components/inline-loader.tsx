"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface InlineLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
} as const;

export function InlineLoader({ className, size = "md", label }: InlineLoaderProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex rounded-full border-muted/30 border-t-primary animate-[spin_0.8s_linear_infinite]",
          sizeMap[size]
        )}
        aria-hidden="true"
      />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}
