import type { Meta, StoryObj } from "@storybook/react-vite";

import { ScrollArea } from "@/components/ui/scroll-area";

const meta = {
  title: "UI/Layout/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-56 w-[360px] max-w-full rounded-md border p-3">
      <div className="grid gap-2">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="rounded-md border bg-card px-3 py-2 text-sm">
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
