import type { Meta, StoryObj } from "@storybook/react-vite";

import { AnimatedLink } from "@/components/ui/animated-link";

const meta = {
  title: "UI/Navigation/AnimatedLink",
  component: AnimatedLink,
  tags: ["autodocs"],
} satisfies Meta<typeof AnimatedLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <AnimatedLink href="#">Link</AnimatedLink>,
};

export const NoUnderline: Story = {
  render: () => (
    <AnimatedLink href="#" underline={false}>
      Link without underline
    </AnimatedLink>
  ),
};

export const NoNeon: Story = {
  render: () => (
    <AnimatedLink href="#" neon={false}>
      Link without neon
    </AnimatedLink>
  ),
};
