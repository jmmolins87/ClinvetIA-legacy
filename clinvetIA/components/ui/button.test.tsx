import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders and handles click", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole("button", { name: "Click" }));
    expect(onClick).toHaveBeenCalled();
  });

  it("supports variants", () => {
    const { rerender } = render(<Button variant="default">A</Button>);
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("data-variant", "default");

    rerender(<Button variant="secondary">B</Button>);
    expect(screen.getByRole("button", { name: "B" })).toHaveAttribute("data-variant", "secondary");

    rerender(<Button variant="tertiary">BT</Button>);
    expect(screen.getByRole("button", { name: "BT" })).toHaveAttribute("data-variant", "tertiary");

    rerender(<Button variant="outline">C</Button>);
    expect(screen.getByRole("button", { name: "C" })).toHaveAttribute("data-variant", "outline");

    rerender(<Button variant="ghost">D</Button>);
    expect(screen.getByRole("button", { name: "D" })).toHaveAttribute("data-variant", "ghost");
  });

  it("supports asChild", () => {
    render(
      <Button asChild>
        <a href="/x">Go</a>
      </Button>
    );

    const link = screen.getByRole("link", { name: "Go" });
    expect(link).toHaveAttribute("href", "/x");
    expect(link).toHaveAttribute("data-slot", "button");
  });
});
