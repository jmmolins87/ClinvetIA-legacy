import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const meta = {
  title: "UI/Avatars/Avatar",
  component: Avatar,
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarFallback>JM</AvatarFallback>
      </Avatar>
      <Avatar className="size-12">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <Avatar className="size-16">
        <AvatarFallback>CD</AvatarFallback>
      </Avatar>
    </div>
  ),
};
