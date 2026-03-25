import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const meta = {
  title: "UI/Forms/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

function CheckboxRow({ defaultChecked, disabled }: { defaultChecked?: boolean; disabled?: boolean }) {
  const [checked, setChecked] = React.useState<boolean>(Boolean(defaultChecked));
  const id = React.useId();

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        disabled={disabled}
        checked={checked}
        onCheckedChange={(next) => setChecked(Boolean(next))}
      />
      <Label htmlFor={id}>{disabled ? "Disabled" : checked ? "Checked" : "Unchecked"}</Label>
    </div>
  );
}

export const States: Story = {
  render: () => (
    <div className="grid gap-3">
      <CheckboxRow />
      <CheckboxRow defaultChecked />
      <CheckboxRow disabled />
      <CheckboxRow defaultChecked disabled />
    </div>
  ),
};
