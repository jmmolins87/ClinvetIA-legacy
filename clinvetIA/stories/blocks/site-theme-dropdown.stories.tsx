import type { Meta, StoryObj } from "@storybook/react-vite";

import { SiteThemeDropdown } from "../../components/blocks/site-theme-dropdown";

const meta = {
  title: "Blocks/SiteThemeDropdown",
  component: SiteThemeDropdown,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Dropdown de tema (Claro/Oscuro/Sistema) basado en Radix DropdownMenu + next-themes. Incluye variante `size=\"large\"` para menu mobile.",
      },
    },
  },
} satisfies Meta<typeof SiteThemeDropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
Default.parameters = {
  codegen: () => `import { SiteThemeDropdown } from "@/components/blocks/site-theme-dropdown";

export function HeaderRight() {
  return <SiteThemeDropdown />;
}`,
};

export const Large: Story = {
  args: { size: "large" },
  parameters: {
    codegen: (args: { size?: "default" | "large" }) => `import { SiteThemeDropdown } from "@/components/blocks/site-theme-dropdown";

export function HeaderRight() {
  return <SiteThemeDropdown${args?.size ? ` size=\"${args.size}\"` : ""} />;
}`,
  },
};
