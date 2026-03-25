import * as React from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import { icons } from "lucide-react";

import { cn } from "@/lib/utils";

type BaseIconName = keyof typeof icons;

// lucide-react also exports "FooIcon" aliases; accept both forms.
export type IconName = BaseIconName | `${BaseIconName}Icon`;

interface IconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  "aria-label"?: string;
}

function getSizeClass(size: number): string {
  return `size-${size}`;
}

export function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  className,
  "aria-label": ariaLabel,
  ...props
}: IconProps) {
  const baseName = (
    name in icons ? name : name.endsWith("Icon") ? name.slice(0, -4) : name
  ) as BaseIconName;

  const IconComponent = icons[baseName] as LucideIcon | undefined;

  if (!IconComponent) return null;

  return (
    <IconComponent
      className={cn("shrink-0", getSizeClass(size), className)}
      size={size}
      strokeWidth={strokeWidth}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      {...props}
    />
  );
}
