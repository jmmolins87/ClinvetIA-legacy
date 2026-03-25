import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ScrollDownButton } from "@/components/ui/scroll-down-button";

describe("ScrollDownButton", () => {
  it("renders and calls onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<ScrollDownButton aria-label="Scroll" onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "Scroll" }));
    expect(onClick).toHaveBeenCalled();
  });
});
