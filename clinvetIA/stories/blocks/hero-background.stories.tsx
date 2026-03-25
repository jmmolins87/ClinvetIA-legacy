import type { Meta, StoryObj } from "@storybook/react-vite";

import { HeroBackground } from "../../components/blocks/hero-background";

const meta = {
  title: "Blocks/HeroBackground",
  component: HeroBackground,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HeroBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="relative h-dvh w-full bg-background">
      <HeroBackground
        video={{
          srcWebm: "/videos/bg-hero/bg-Hero_home.webm",
          srcMp4: "/videos/bg-hero/bg-Hero_home.mp4",
          srcOgv: "/videos/bg-hero/bg-Hero_home.ogv",
        }}
      />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 text-center">
        <div className="text-3xl font-semibold tracking-tight">Hero background</div>
        <div className="mt-2 text-muted-foreground">Video layer + gradient overlay.</div>
      </div>
    </div>
  ),
};
