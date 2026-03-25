import Image from "next/image";

import { cn } from "@/lib/utils";

export function Logo({
  width = 200,
  height = 50,
  className,
  priority,
}: {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt="Clinvetia"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-12 w-auto", className)}
    />
  );
}
