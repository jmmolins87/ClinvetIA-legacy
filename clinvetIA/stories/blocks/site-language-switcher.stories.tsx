import type { Meta, StoryObj } from "@storybook/react-vite";

import { SiteLanguageSwitcher } from "../../components/blocks/site-language-switcher";

const meta = {
  title: "Blocks/SiteLanguageSwitcher",
  component: SiteLanguageSwitcher,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Switcher ES/EN basado en `Switch`. Persistencia en localStorage (\"clinvetia.lang\") y actualiza `document.documentElement.lang`.",
      },
    },
  },
} satisfies Meta<typeof SiteLanguageSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
Default.parameters = {
  codegen: () => `import { SiteLanguageSwitcher } from "@/components/blocks/site-language-switcher";

export function HeaderRight() {
  return <SiteLanguageSwitcher />;
}`,
};
