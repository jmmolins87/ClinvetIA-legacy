import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const meta = {
  title: "UI/Forms/Textarea",
  component: Textarea,
  tags: ["autodocs"],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div className="grid w-[520px] max-w-full gap-4">
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" placeholder="Write something..." />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="disabled">Disabled</Label>
        <Textarea id="disabled" disabled placeholder="Disabled" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="invalid">Invalid</Label>
        <Textarea id="invalid" aria-invalid placeholder="Invalid" />
      </div>
    </div>
  ),
};
