import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimeSlotsSkeleton } from "../TimeSlotsSkeleton";

describe("TimeSlotsSkeleton", () => {
  it("renders time slots skeleton structure", () => {
    render(<TimeSlotsSkeleton />);
    
    // Should have accessible label
    expect(screen.getByLabelText("Loading time slots")).toBeInTheDocument();
  });

  it("renders default 17 slot skeletons", () => {
    const { container } = render(<TimeSlotsSkeleton />);
    
    // Count skeleton slots
    const slots = container.querySelectorAll('[class*="h-11"]');
    expect(slots).toHaveLength(17);
  });

  it("renders custom count of slot skeletons", () => {
    const { container } = render(<TimeSlotsSkeleton count={10} />);
    
    const slots = container.querySelectorAll('[class*="h-11"]');
    expect(slots).toHaveLength(10);
  });

  it("applies custom className", () => {
    const { container } = render(<TimeSlotsSkeleton className="custom-class" />);
    
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("has grid layout classes", () => {
    const { container } = render(<TimeSlotsSkeleton />);
    
    expect(container.firstChild).toHaveClass("grid");
    expect(container.firstChild).toHaveClass("grid-cols-2");
    expect(container.firstChild).toHaveClass("sm:grid-cols-3");
    expect(container.firstChild).toHaveClass("lg:grid-cols-4");
  });

  it("has animation-pulse class on skeleton elements", () => {
    const { container } = render(<TimeSlotsSkeleton />);
    
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
