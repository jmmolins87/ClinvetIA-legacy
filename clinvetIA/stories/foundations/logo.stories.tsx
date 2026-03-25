import type { Meta, StoryObj } from "@storybook/react-vite";

import { Logo } from "../../components/logo";

const meta = {
  title: "Foundations/Logo",
  component: Logo,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    usageCode: `import { Logo } from "@/components/logo";

export function Brand() {
  return <Logo className="h-14" />;
}`,
    docs: {
      description: {
        component:
          "Componente de marca basado en next/image. Centraliza `alt`, `src` y tamanos comunes para evitar duplicacion en bloques.",
      },
    },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { className: "h-14" },
};
