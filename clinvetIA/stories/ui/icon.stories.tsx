import type { Meta, StoryObj } from "@storybook/react-vite";
import { icons } from "lucide-react";

import { Icon, type IconName } from "../../components/ui/icon";

const iconNames = Object.keys(icons) as IconName[];

const meta = {
  title: "UI/Data Display/Icon",
  component: Icon,
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: "select",
      options: iconNames,
    },
    size: {
      control: { type: "range", min: 12, max: 48, step: 2 },
    },
    strokeWidth: {
      control: { type: "range", min: 1, max: 3, step: 0.25 },
    },
  },
  args: {
    name: "Activity",
    size: 24,
    strokeWidth: 2,
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      {[16, 20, 24, 32, 48, 64].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icon name="Star" size={size} className="text-primary" />
          <span className="text-xs text-muted-foreground">{size}px</span>
        </div>
      ))}
    </div>
  ),
};

export const AllIcons: Story = {
  args: {
    size: 20
  },

  parameters: { layout: "fullscreen" },

  render: () => (
    <div className="p-6">
      <div className="mb-4 text-sm text-muted-foreground">
        {iconNames.length} icons
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {iconNames.map((name) => (
          <div key={name} className="flex items-center gap-2 rounded-md border p-2">
            <Icon name={name} size={20} />
            <span className="text-xs text-muted-foreground truncate">{name}</span>
          </div>
        ))}
      </div>
    </div>
  )
};
