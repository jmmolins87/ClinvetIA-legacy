import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  NeonCard,
  NeonCardContent,
  NeonCardDescription,
  NeonCardFooter,
  NeonCardHeader,
  NeonCardTitle,
} from "@/components/ui/neon-card";
import { Button } from "@/components/ui/button";
import { CancelButton } from "@/components/ui/cancel-button";

const meta = {
  title: "UI/Data Display/NeonCard",
  component: NeonCard,
  tags: ["autodocs"],
} satisfies Meta<typeof NeonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <NeonCard className="w-[440px] max-w-full">
      <NeonCardHeader>
        <NeonCardTitle>Neon Card</NeonCardTitle>
        <NeonCardDescription>Hover for border and glow effects.</NeonCardDescription>
      </NeonCardHeader>
      <NeonCardContent>
        <div className="text-sm text-muted-foreground">
          Use this for highlighted panels.
        </div>
      </NeonCardContent>
      <NeonCardFooter className="justify-end gap-2">
        <CancelButton>Cancel</CancelButton>
        <Button>Continue</Button>
      </NeonCardFooter>
    </NeonCard>
  ),
};

export const NoHoverNoGlow: Story = {
  render: () => (
    <NeonCard hover={false} glow={false} className="w-[440px] max-w-full">
      <NeonCardHeader>
        <NeonCardTitle>Static</NeonCardTitle>
        <NeonCardDescription>No hover and no glow.</NeonCardDescription>
      </NeonCardHeader>
      <NeonCardContent>
        <div className="text-sm text-muted-foreground">Static presentation.</div>
      </NeonCardContent>
    </NeonCard>
  ),
};
