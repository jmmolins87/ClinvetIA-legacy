/**
 * Calendar Skeleton Loader
 * 
 * Displays a skeleton placeholder while the calendar is loading
 * to prevent layout shift and provide visual feedback.
 * 
 * Uses the Skeleton component from components/ui/skeleton.tsx
 */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CalendarSkeletonProps {
  className?: string;
}

export function CalendarSkeleton({ className }: CalendarSkeletonProps) {
  return (
    <div className={cn("w-full", className)} aria-label="Loading calendar">
      {/* Month header with navigation */}
      <div className="flex items-center justify-between gap-2 pb-2 md:pb-3 mb-2">
        {/* Previous button skeleton */}
        <Skeleton className="h-8 w-8 md:h-9 md:w-9 shrink-0" />
        
        {/* Month title skeleton */}
        <div className="min-w-0 flex-1 flex justify-center">
          <Skeleton className="h-5 w-32" />
        </div>
        
        {/* Next button skeleton */}
        <Skeleton className="h-8 w-8 md:h-9 md:w-9 shrink-0" />
      </div>

      {/* Weekday labels skeleton */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 pb-1.5 md:pb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={`weekday-${i}`}
            className="h-4"
            style={{
              animationDelay: `${i * 50}ms`,
            }}
          />
        ))}
      </div>

      {/* Calendar grid skeleton */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton
            key={`day-${i}`}
            className="aspect-square"
            style={{
              animationDelay: `${i * 20}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
