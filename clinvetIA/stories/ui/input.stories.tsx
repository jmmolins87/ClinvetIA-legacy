import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta = {
  title: "UI/Forms/Input",
  component: Input,
  tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="grid w-[420px] max-w-full gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" placeholder="name@domain.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="disabled">Disabled</Label>
        <Input id="disabled" disabled placeholder="Disabled" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="invalid">Invalid</Label>
        <Input id="invalid" aria-invalid placeholder="Invalid" />
      </div>
    </div>
  ),
};
