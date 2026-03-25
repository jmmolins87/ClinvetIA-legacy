import * as React from "react";

import { cn } from "@/lib/utils";

type AvatarIASize = "default" | "lg" | "xl" | "2xl";

export interface AvatarIAProps extends React.ComponentProps<"div"> {
  srcMp4?: string;
  srcWebm?: string;
  srcOgv?: string;
  videoClassName?: string;
  size?: AvatarIASize;
}

export function AvatarIA({
  className,
  videoClassName,
  size = "default",
  srcMp4 = "/videos/avatar/avatar.mp4",
  srcWebm = "/videos/avatar/avatar.webm",
  srcOgv = "/videos/avatar/avatar.ogv",
  ...props
}: AvatarIAProps): React.JSX.Element {
  const sizeClass =
    size === "2xl"
      ? "size-24 lg:size-32"
      : size === "xl"
        ? "size-16 lg:size-24"
        : size === "lg"
          ? "size-14 lg:size-16"
          : "size-12";

  return (
    <div
      data-slot="avatar-ia"
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border bg-muted/40 cursor-pointer",
        sizeClass,
        className
      )}
      {...props}
    >
      <video
        className={cn("h-full w-full object-cover", videoClassName)}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src={srcWebm} type="video/webm" />
        <source src={srcMp4} type="video/mp4" />
        <source src={srcOgv} type="video/ogg" />
      </video>
    </div>
  );
}
