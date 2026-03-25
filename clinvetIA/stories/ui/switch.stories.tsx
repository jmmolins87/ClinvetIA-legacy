import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const meta = {
  title: "UI/Forms/Switch",
  component: Switch,
  tags: ["autodocs"],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

function SwitchRow({
  size,
  disabled,
  defaultChecked,
}: {
  size?: "sm" | "default";
  disabled?: boolean;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = React.useState(Boolean(defaultChecked));
  const id = React.useId();
  return (
    <div className="flex items-center gap-2">
      <Switch
        id={id}
        size={size}
        disabled={disabled}
        checked={checked}
        onCheckedChange={setChecked}
      />
      <Label htmlFor={id}>
        {size ?? "default"}{disabled ? " (disabled)" : ""}
      </Label>
    </div>
  );
}

export const States: Story = {
  render: () => (
    <div className="grid gap-3">
      <SwitchRow />
      <SwitchRow defaultChecked />
      <SwitchRow size="sm" />
      <SwitchRow size="sm" defaultChecked />
      <SwitchRow disabled />
      <SwitchRow defaultChecked disabled />
      <SwitchRow size="sm" disabled />
      <SwitchRow size="sm" defaultChecked disabled />
    </div>
  ),
};
