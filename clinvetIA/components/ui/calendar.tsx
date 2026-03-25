"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  locale?: string;
  disabled?: (date: Date) => boolean;
  fromDate?: Date;
  toDate?: Date;
  className?: string;
}

export function Calendar({
  selected,
  onSelect,
  month,
  onMonthChange,
  locale = "es-ES",
  disabled,
  fromDate,
  toDate,
  className,
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(() => month ?? new Date());

  React.useEffect(() => {
    if (month) setInternalMonth(month);
  }, [month]);

  const currentMonth = month ?? internalMonth;
  const year = currentMonth.getFullYear();
  const mon = currentMonth.getMonth();

  const firstDay = new Date(year, mon, 1);
  const lastDay = new Date(year, mon + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay(); // 0..6 (Sun..Sat)

  const min = fromDate ? startOfDay(fromDate) : null;
  const max = toDate ? startOfDay(toDate) : null;

  const setMonth = (next: Date) => {
    if (onMonthChange) onMonthChange(next);
    if (!month) setInternalMonth(next);
  };

  // Keyboard navigation handler
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent, day: number, date: Date) => {
      const isDisabled =
        Boolean(disabled?.(date)) ||
        (min ? date.getTime() < min.getTime() : false) ||
        (max ? date.getTime() > max.getTime() : false);

      if (isDisabled) return;

      switch (e.key) {
        case "ArrowLeft": {
          e.preventDefault();
          const prevDate = new Date(year, mon, day - 1);
          if (prevDate.getMonth() === mon) {
            onSelect?.(prevDate);
          }
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          const nextDate = new Date(year, mon, day + 1);
          if (nextDate.getMonth() === mon) {
            onSelect?.(nextDate);
          }
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prevWeek = new Date(year, mon, day - 7);
          if (prevWeek.getMonth() === mon) {
            onSelect?.(prevWeek);
          }
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          const nextWeek = new Date(year, mon, day + 7);
          if (nextWeek.getMonth() === mon) {
            onSelect?.(nextWeek);
          }
          break;
        }
        case "Home": {
          e.preventDefault();
          onSelect?.(new Date(year, mon, 1));
          break;
        }
        case "End": {
          e.preventDefault();
          onSelect?.(new Date(year, mon, daysInMonth));
          break;
        }
        case "PageUp": {
          e.preventDefault();
          setMonth(new Date(year, mon - 1, 1));
          break;
        }
        case "PageDown": {
          e.preventDefault();
          setMonth(new Date(year, mon + 1, 1));
          break;
        }
        case "Enter":
        case " ": {
          e.preventDefault();
          onSelect?.(date);
          break;
        }
      }
    },
    [year, mon, daysInMonth, min, max, disabled, onSelect, setMonth]
  );

  const weekdayLabels = React.useMemo(() => {
    const base = new Date(2024, 0, 7); // Sunday
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(base.getTime() + i * 24 * 60 * 60_000)));
  }, [locale]);

  const title = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(currentMonth);

  const cells: Array<React.ReactNode> = [];
  const total = Math.ceil((daysInMonth + startingDay) / 7) * 7;

  for (let i = 0; i < total; i++) {
    if (i < startingDay || i >= startingDay + daysInMonth) {
      cells.push(<div key={`empty-${i}`} className="aspect-square" />);
      continue;
    }

    const day = i - startingDay + 1;
    const date = new Date(year, mon, day);
    const dayStart = startOfDay(date);

    const isDisabled =
      Boolean(disabled?.(date)) ||
      (min ? dayStart.getTime() < min.getTime() : false) ||
      (max ? dayStart.getTime() > max.getTime() : false);
    const isSelected = selected ? isSameDay(date, selected) : false;

    const label = `${year}-${pad2(mon + 1)}-${pad2(day)}`;

    cells.push(
      <button
        key={label}
        type="button"
        disabled={isDisabled}
        onClick={() => onSelect?.(date)}
        onKeyDown={(e) => handleKeyDown(e, day, date)}
        role="gridcell"
        aria-selected={isSelected}
        aria-disabled={isDisabled}
        aria-label={label}
        tabIndex={isSelected ? 0 : -1}
        className={cn(
          "aspect-square rounded-md md:rounded-lg border text-xs md:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 md:focus:ring-offset-2",
          isDisabled ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-primary/10 hover:border-primary",
          isSelected
            ? "bg-primary text-primary-foreground border-primary dark:glow-primary"
            : "bg-card text-foreground border-border"
        )}
      >
        {day}
      </button>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between gap-2 pb-2 md:pb-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setMonth(new Date(year, mon - 1, 1))}
          aria-label="Previous month"
          className="h-8 w-8 md:h-9 md:w-9 shrink-0"
        >
          <Icon name="ChevronLeft" className="size-3 md:size-4" />
        </Button>
        <div className="min-w-0 flex-1 text-center text-xs md:text-sm font-semibold capitalize">{title}</div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setMonth(new Date(year, mon + 1, 1))}
          aria-label="Next month"
          className="h-8 w-8 md:h-9 md:w-9 shrink-0"
        >
          <Icon name="ChevronRight" className="size-3 md:size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 pb-1.5 md:pb-2">
        {weekdayLabels.map((w, i) => (
          <div 
            key={w} 
            role="columnheader" 
            className="text-center text-[10px] md:text-[11px] font-medium text-muted-foreground"
          >
            {w}
          </div>
        ))}
      </div>

      <div 
        className="grid grid-cols-7 gap-1 md:gap-2" 
        role="grid" 
        aria-label={title}
      >
        {cells}
      </div>
    </div>
  );
}
