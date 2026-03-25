"use client";

import * as React from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BookingStatus } from "./status-badge";

export interface Booking {
  id: string;
  email: string;
  status: BookingStatus;
  startAt: string;
  createdAt: string;
}

interface BookingActionsProps {
  booking: Booking;
  onView?: (booking: Booking) => void;
  compact?: boolean;
}

export function BookingActions({ booking, onView, compact = false }: BookingActionsProps) {

  const handleView = () => {
    if (onView) {
      onView(booking);
    }
  };

  if (compact) {
    return (
      <div className="inline-flex items-center justify-end gap-2">
        {onView && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label="View"
            onClick={handleView}
          >
            <Icon name="Eye" className="size-4" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label="Open menu"
            >
              <Icon name="MoveHorizontal" className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {onView && (
              <>
                <DropdownMenuItem onClick={handleView} className="gap-2">
                  <Icon name="Eye" className="size-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={() => toast.message("Reschedule (coming soon)")}
              className="gap-2"
            >
              <Icon name="CalendarClock" className="size-4" />
              Reschedule
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.message("Cancel (coming soon)")}
              className="gap-2 text-destructive focus:text-destructive"
              disabled={booking.status === "CANCELLED"}
            >
              <Icon name="CircleX" className="size-4" />
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleView}
      >
        <Icon name="Eye" className="size-3 mr-1" />
        View
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toast.message("Reschedule (coming soon)")}
      >
        <Icon name="CalendarClock" className="size-3 mr-1" />
        Reschedule
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toast.message("Cancel (coming soon)")}
        className="text-destructive hover:text-destructive"
        disabled={booking.status === "CANCELLED"}
      >
        <Icon name="CircleX" className="size-3 mr-1" />
        Cancel
      </Button>
    </div>
  );
}
