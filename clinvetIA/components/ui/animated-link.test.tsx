import { render, screen } from "@testing-library/react";

import { AnimatedLink } from "@/components/ui/animated-link";

describe("AnimatedLink", () => {
  it("renders with href", () => {
    render(
      <AnimatedLink href="/a" underline neon>
        A
      </AnimatedLink>
    );
    expect(screen.getByRole("link", { name: "A" })).toHaveAttribute("href", "/a");
  });

  it("supports disabling underline/neon", () => {
    const { rerender } = render(
      <AnimatedLink href="/a" underline={false} neon={false}>
        A
      </AnimatedLink>
    );
    expect(screen.getByRole("link", { name: "A" })).toBeInTheDocument();

    rerender(
      <AnimatedLink href="/b" underline neon={false}>
        B
      </AnimatedLink>
    );
    expect(screen.getByRole("link", { name: "B" })).toHaveAttribute("href", "/b");
  });
});
