import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Calendar } from "@/components/ui/calendar";

describe("Calendar", () => {
  it("renders month title and selects a date", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const month = new Date(2026, 0, 1);
    render(<Calendar month={month} onSelect={onSelect} locale="en-US" />);

    expect(screen.getByText(/January 2026/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "2026-01-01" }));
    expect(onSelect).toHaveBeenCalled();
  });

  it("disables dates via fromDate/toDate and disabled fn", () => {
    const month = new Date(2026, 0, 1);
    render(
      <Calendar
        month={month}
        fromDate={new Date(2026, 0, 10)}
        toDate={new Date(2026, 0, 20)}
        disabled={(d) => d.getDate() === 15}
        locale="en-US"
      />
    );

    expect(screen.getByRole("button", { name: "2026-01-01" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "2026-01-15" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "2026-01-25" })).toBeDisabled();
  });

  it("changes month using arrows and calls onMonthChange", async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    const month = new Date(2026, 0, 1);
    render(<Calendar month={month} onMonthChange={onMonthChange} locale="en-US" />);

    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(onMonthChange).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(onMonthChange).toHaveBeenCalledTimes(2);
  });
});
