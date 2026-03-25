import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarSkeleton } from "../CalendarSkeleton";

describe("CalendarSkeleton", () => {
  it("renders calendar skeleton structure", () => {
    render(<CalendarSkeleton />);
    
    // Should have accessible label
    expect(screen.getByLabelText("Loading calendar")).toBeInTheDocument();
  });

  it("renders 35 day cells (5 weeks)", () => {
    const { container } = render(<CalendarSkeleton />);
    
    // Count skeleton day cells
    const dayCells = container.querySelectorAll('[class*="aspect-square"]');
    expect(dayCells).toHaveLength(35);
  });

  it("renders 7 weekday labels", () => {
    const { container } = render(<CalendarSkeleton />);
    
    // Count weekday skeletons in the weekday grid
    const weekdayGrid = container.querySelector('.grid.grid-cols-7.gap-1');
    const weekdays = weekdayGrid?.querySelectorAll('div');
    expect(weekdays).toHaveLength(7);
  });

  it("applies custom className", () => {
    const { container } = render(<CalendarSkeleton className="custom-class" />);
    
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("has animation-pulse class on skeleton elements", () => {
    const { container } = render(<CalendarSkeleton />);
    
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
