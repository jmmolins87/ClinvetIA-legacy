import * as React from "react";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md",
        "bg-gradient-to-br from-gradient-from/18 via-muted/35 to-gradient-to/14",
        "dark:from-gradient-from/28 dark:via-muted/30 dark:to-gradient-to/22",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
