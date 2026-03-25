import type { Meta, StoryObj } from "@storybook/react-vite";

import * as React from "react";

import { SiteHeader } from "../../components/blocks/site-header";

const meta = {
  title: "Blocks/SiteHeader",
  component: SiteHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Header de sitio (bloque) con navegacion, CTAs, switch de idioma, theme toggle y menu mobile tipo Sheet. Incluye indicador animado de link activo y estados de scroll.",
      },
    },
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="min-h-[220dvh] bg-background text-foreground">
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[90dvh] bg-[radial-gradient(60rem_40rem_at_20%_25%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_65%),radial-gradient(50rem_34rem_at_85%_65%,color-mix(in_oklch,var(--accent)_14%,transparent),transparent_70%)]"
        />

        <SiteHeader />

        <div className="mx-auto max-w-screen-2xl px-4 pt-[calc(var(--site-header-h)+2.5rem)] pb-14">
          <div className="max-w-xl text-sm text-muted-foreground">
            Scroll para ver el header: arriba es transparente; al hacer scroll aparece el fondo segun el theme.
          </div>
        </div>

        <div className="mx-auto max-w-screen-2xl px-4 py-16">
          <div className="h-[160dvh] rounded-xl border border-border/60 bg-card/40" />
        </div>
      </div>
    </div>
  ),
};
Default.parameters = {
  codegen: () => `import { SiteHeader } from "@/components/blocks/site-header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}`,
};

function ScrolledHarness() {
  React.useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 420, behavior: "auto" });
    });
  }, []);

  return (
    <div className="min-h-[220dvh] bg-background text-foreground">
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[90dvh] bg-[radial-gradient(60rem_40rem_at_20%_25%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_65%),radial-gradient(50rem_34rem_at_85%_65%,color-mix(in_oklch,var(--accent)_14%,transparent),transparent_70%)]"
        />

        <SiteHeader />

        <div className="mx-auto max-w-screen-2xl px-4 pt-[calc(var(--site-header-h)+2.5rem)] pb-14">
          <div className="max-w-xl text-sm text-muted-foreground">
            Forzado a scroll ~420px.
          </div>
        </div>

        <div className="mx-auto max-w-screen-2xl px-4 py-16">
          <div className="h-[160dvh] rounded-xl border border-border/60 bg-card/40" />
        </div>
      </div>
    </div>
  );
}

export const Scrolled: Story = {
  render: () => <ScrolledHarness />,
};
