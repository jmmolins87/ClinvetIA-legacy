import type { Meta, StoryObj } from "@storybook/react-vite";

import { SiteCta } from "../../components/blocks/site-cta";

const meta = {
  title: "Blocks/SiteCta",
  component: SiteCta,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Bloque CTA reutilizable (estilo legacy `ScenariosCta`): card con titulo/descripcion y dos CTAs (ROI primary + Demo outline).",
      },
    },
  },
} satisfies Meta<typeof SiteCta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="mx-auto max-w-screen-2xl px-4 py-10">
      <SiteCta {...args} />
    </div>
  ),
  args: {
    title: "Listo para empezar?",
    description: "Reserva una demo o calcula el impacto en tu ROI.",
    icon: "Sparkles",
    roiHref: "/roi",
    demoHref: "/reservar",
    roiLabel: "ROI",
    demoLabel: "Reservar demo",
  },
  parameters: {
    codegen: (args: {
      title?: string;
      description?: string;
      icon?: string;
      roiHref?: string;
      demoHref?: string;
      roiLabel?: string;
      demoLabel?: string;
    }) => `import { SiteCta } from "@/components/blocks/site-cta";

export function PageCta() {
  return (
    <SiteCta
      title={${JSON.stringify(args.title ?? "")}}
      description={${JSON.stringify(args.description ?? "")}}
      icon={${JSON.stringify(args.icon ?? "Sparkles")}}
      roiHref={${JSON.stringify(args.roiHref ?? "/roi")}}
      demoHref={${JSON.stringify(args.demoHref ?? "/reservar")}}
      roiLabel={${JSON.stringify(args.roiLabel ?? "ROI")}}
      demoLabel={${JSON.stringify(args.demoLabel ?? "Reservar demo")}}
    />
  );
}`,
  },
};
