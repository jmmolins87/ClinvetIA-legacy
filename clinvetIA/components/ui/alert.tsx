import * as React from "react";

import { cn } from "@/lib/utils";

function Alert({ className, variant = "default", ...props }: React.ComponentProps<"div"> & {
  variant?: "default" | "success" | "info" | "warning" | "destructive";
}) {
  return (
    <div
      data-slot="alert"
      role="alert"
      data-variant={variant}
      className={cn(
        "relative w-full rounded-lg border p-4 text-sm",
        "flex items-start gap-3",
        variant === "default" && "bg-card text-card-foreground",
        variant === "success" && "bg-emerald-500/15 text-emerald-800 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-400/40",
        variant === "info" && "bg-sky-500/15 text-sky-800 border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-200 dark:border-sky-400/40",
        variant === "warning" && "bg-amber-500/15 text-amber-900 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-400/40",
        variant === "destructive" && "bg-destructive/15 text-destructive border-destructive/30 dark:bg-destructive/20 dark:text-destructive-foreground dark:border-destructive/40",
        className
      )}
      {...props}
    />
  );
}

function AlertIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-icon"
      className={cn("mt-0.5 shrink-0 text-current", className)}
      {...props}
    />
  );
}

function AlertContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-content"
      className={cn("min-w-0 flex-1", className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return (
    <h5
      data-slot="alert-title"
      className={cn("mb-1 font-medium leading-none", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm text-current/80", className)}
      {...props}
    />
  );
}

export { Alert, AlertIcon, AlertContent, AlertTitle, AlertDescription };
