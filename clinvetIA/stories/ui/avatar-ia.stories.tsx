import type { Meta, StoryObj } from "@storybook/react-vite";

import { AvatarIA } from "../../components/ui/avatar-ia";

const meta = {
  title: "UI/Avatars/AvatarIA",
  component: AvatarIA,
  tags: ["autodocs"],
} satisfies Meta<typeof AvatarIA>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <AvatarIA size="default" />
      <AvatarIA size="lg" />
      <AvatarIA size="xl" />
      <AvatarIA size="2xl" />
    </div>
  ),
};
