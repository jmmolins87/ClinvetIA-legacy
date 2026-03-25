import type { Meta, StoryObj } from "@storybook/react-vite";

import { SiteFooter } from "../../components/blocks/site-footer";

const meta = {
  title: "Blocks/SiteFooter",
  component: SiteFooter,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Footer de sitio (bloque) con columnas de enlaces, CTA section (ROI/Demo) y enlaces legales. Pensado para usarse al final del layout.",
      },
    },
  },
} satisfies Meta<typeof SiteFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="min-h-[50vh] bg-background">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 pb-20 text-sm text-muted-foreground">
        Contenido de ejemplo.
      </div>
      <SiteFooter />
    </div>
  ),
};
Default.parameters = {
  codegen: () => `import { SiteFooter } from "@/components/blocks/site-footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}`,
};

export const Compact: Story = {
  render: () => (
    <div className="min-h-[50vh] bg-background">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 pb-20 text-sm text-muted-foreground">
        Contenido de ejemplo.
      </div>
      <SiteFooter density="compact" />
    </div>
  ),
};
