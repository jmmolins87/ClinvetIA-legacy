import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const meta = {
  title: "UI/Overlays/Popover",
  component: PopoverContent,
  tags: ["autodocs"],
} satisfies Meta<typeof PopoverContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="grid gap-1">
          <div className="text-sm font-medium">Popover title</div>
          <div className="text-sm text-muted-foreground">
            This is a simple popover content.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
