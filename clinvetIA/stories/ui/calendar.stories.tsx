import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { Calendar } from "@/components/ui/calendar";

const NOW = Date.now();

const meta = {
  title: "UI/Forms/Calendar",
  component: Calendar,
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

function CalendarWithState() {
  const [selected, setSelected] = React.useState<Date | undefined>(new Date());

  return (
    <div className="w-[360px] max-w-full">
      <Calendar
        selected={selected}
        onSelect={setSelected}
        disabled={(date) => date.getDay() === 0}
        fromDate={new Date(NOW - 1000 * 60 * 60 * 24 * 7)}
        toDate={new Date(NOW + 1000 * 60 * 60 * 24 * 30)}
      />
      <div className="mt-3 text-sm text-muted-foreground">
        Selected: {selected ? selected.toDateString() : "(none)"}
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <CalendarWithState />,
};
