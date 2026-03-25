import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sparkles } from "lucide-react";

import { NeonButton } from "@/components/ui/neon-button";

const meta = {
  title: "UI/Buttons/NeonButton",
  component: NeonButton,
  tags: ["autodocs"],
} satisfies Meta<typeof NeonButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <NeonButton>Default</NeonButton>
      <NeonButton variant="outline">Outline</NeonButton>
      <NeonButton variant="ghost">Ghost</NeonButton>
      <NeonButton disabled>Disabled</NeonButton>
      <NeonButton size="icon" aria-label="Sparkles">
        <Sparkles className="size-4" />
      </NeonButton>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <NeonButton size="sm">Small</NeonButton>
      <NeonButton size="default">Default</NeonButton>
      <NeonButton size="lg">Large</NeonButton>
    </div>
  ),
};
