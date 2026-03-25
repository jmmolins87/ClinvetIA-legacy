import type { Meta, StoryObj } from "@storybook/react-vite";

import { BrandPalette, BrandTypography } from "@/stories/foundations/brand-components";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-lg font-semibold tracking-tight">{title}</div>
          {description ? (
            <div className="mt-1 text-sm text-muted-foreground">{description}</div>
          ) : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function BrandFoundationPage({ view }: { view: "all" | "colors" | "typography" }): JSX.Element {
  return (
    <div className="w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl p-6">
        <div className="mb-6">
          <div className="text-2xl font-semibold tracking-tight">Foundations / Brand</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Light/dark palette tokens come from `app/globals.css`. Typography uses Geist (sans/mono)
            configured in `app/layout.tsx`.
          </div>
        </div>

        <div className="grid gap-6">
          {view === "all" || view === "colors" ? (
            <Section
              title="Colors"
              description="CSS variables used by components and layouts (light + dark)."
            >
              <BrandPalette />
            </Section>
          ) : null}

          {view === "all" || view === "typography" ? (
            <Section title="Typography" description="Font tokens and basic samples.">
              <BrandTypography />
            </Section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Foundations/Brand",
  component: BrandFoundationPage,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BrandFoundationPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  args: {
    view: "all",
  },
};

export const Colors: Story = {
  args: {
    view: "colors",
  },
};

export const Typography: Story = {
  args: {
    view: "typography",
  },
};
