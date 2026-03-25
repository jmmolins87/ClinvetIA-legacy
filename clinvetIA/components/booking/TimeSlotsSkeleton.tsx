/**
 * Time Slots Skeleton Loader
 * 
 * Displays a skeleton placeholder while time slots are loading
 * to prevent layout shift and provide visual feedback.
 * 
 * Uses the Skeleton component from components/ui/skeleton.tsx
 */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TimeSlotsSkeletonProps {
  className?: string;
  count?: number;
}

export function TimeSlotsSkeleton({ 
  className, 
  count = 17 
}: TimeSlotsSkeletonProps) {
  return (
    <div 
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3",
        className
      )}
      aria-label="Loading time slots"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={`slot-${i}`}
          className="h-11 md:h-12"
          style={{
            animationDelay: `${i * 30}ms`,
          }}
        />
      ))}
    </div>
  );
}
