"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { lockScroll } from "@/lib/scroll-lock";

function DialogScrollLockEffect() {
  React.useEffect(() => {
    const unlock = lockScroll();
    return () => unlock();
  }, []);

  return null;
}

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  const ref = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      if (process.env.NODE_ENV === "production") return;

      const cs = window.getComputedStyle(node);
      console.info("[ui] DialogOverlay mounted", {
        className,
        computed: {
          backgroundColor: cs.backgroundColor,
          opacity: cs.opacity,
          backdropFilter: cs.backdropFilter,
          webkitBackdropFilter: (cs as unknown as { webkitBackdropFilter?: string })
            .webkitBackdropFilter,
        },
      });
    },
    [className]
  );

  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      data-overlay-version="ui-overlay-2026-02-07"
      ref={ref}
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "fixed inset-0 z-50",
        "bg-white/40 dark:bg-black/40",
        "backdrop-blur-xl backdrop-saturate-150",
        "overscroll-contain touch-none",
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  overlayClassName,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  overlayClassName?: string;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-lenis-prevent
        className={cn(
          "bg-background/85 supports-[backdrop-filter]:bg-background/65 backdrop-blur-xl backdrop-saturate-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed inset-0 md:inset-auto z-50 rounded-lg border shadow-lg duration-200 outline-none text-xl",
          "w-[90%] md:max-w-[75%] md:h-fit md:max-h-[75vh] md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 overflow-y-auto overscroll-contain touch-auto [-webkit-overflow-scrolling:touch] p-8 pb-24",
          "md:text-base",
          className
        )}
        {...props}
      >
        <DialogScrollLockEffect />
        {children}
      </DialogPrimitive.Content>
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button
            variant="tertiary"
            size="icon"
            className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 size-14"
            aria-label="Close"
          >
            <Icon name="X" className="size-8" />
          </Button>
        </DialogPrimitive.Close>
      )}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button
            variant="tertiary"
            size="icon"
            className="hidden md:fixed md:top-[calc(50%-10rem)] md:right-[calc(50%-10rem)] md:z-50 md:size-14"
            aria-label="Close"
          >
            <Icon name="X" className="size-8" />
          </Button>
        </DialogPrimitive.Close>
      )}
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-3 text-center sm:text-left mb-4", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="secondary">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-3xl md:text-5xl leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
