import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const meta = {
  title: "UI/Forms/Select",
  component: Select,
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="grid w-[420px] max-w-full gap-2">
      <Label htmlFor="pet">Pet</Label>
      <Select id="pet" defaultValue="dog">
        <option value="dog">Dog</option>
        <option value="cat">Cat</option>
        <option value="bird">Bird</option>
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="grid w-[420px] max-w-full gap-2">
      <Label htmlFor="disabled">Disabled</Label>
      <Select id="disabled" disabled>
        <option>Disabled</option>
      </Select>
    </div>
  ),
};
