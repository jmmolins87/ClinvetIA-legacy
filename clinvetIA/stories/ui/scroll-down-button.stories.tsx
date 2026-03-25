import type { Meta, StoryObj } from "@storybook/react-vite";

import { ScrollDownButton } from "../../components/ui/scroll-down-button";

const meta = {
  title: "UI/Buttons/ScrollDownButton",
  component: ScrollDownButton,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ScrollDownButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center justify-center py-10">
      <ScrollDownButton aria-label="Scroll down" />
    </div>
  ),
};

export const WithTarget: Story = {
  render: () => (
    <div className="min-h-[60vh]">
      <div className="h-[40vh] p-6 text-sm text-muted-foreground">
        Click to scroll to target.
      </div>
      <div className="flex items-center justify-center py-6">
        <ScrollDownButton aria-label="Scroll to target" targetId="target" />
      </div>
      <div id="target" className="h-[40vh] rounded-xl border bg-card p-6">
        Target
      </div>
    </div>
  ),
};

export const OverHero: Story = {
  render: () => (
    <div className="relative h-[420px] w-[min(900px,100%)] overflow-hidden rounded-xl border bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <div className="relative z-10 p-8">
        <div className="text-2xl font-semibold tracking-tight">Hero</div>
        <div className="mt-2 text-muted-foreground">Place it centered at the bottom of the hero.</div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <ScrollDownButton aria-label="Scroll down" />
      </div>
    </div>
  ),
};
