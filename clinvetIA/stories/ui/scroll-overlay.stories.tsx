import type { Meta, StoryObj } from "@storybook/react-vite";

import { ScrollOverlay } from "../../components/ui/scroll-overlay";

const meta = {
  title: "UI/Overlays/ScrollOverlay",
  component: ScrollOverlay,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Contained: Story = {
  render: () => (
    <div className="relative h-[520px] w-full overflow-auto rounded-xl border bg-background">
      <div className="p-6 text-sm text-foreground/80">
        <div className="mx-auto max-w-xl space-y-3">
          {Array.from({ length: 24 }).map((_, i) => (
            <p key={i}>Scrollable container line {i + 1}.</p>
          ))}
        </div>
      </div>
      <ScrollOverlay
        mode="contained"
        aria-label="Scroll down"
        targetId="target"
      />

      <div id="target" className="p-6 text-sm text-muted-foreground">
        Target
      </div>
    </div>
  ),
};
