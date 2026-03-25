import type { Meta, StoryObj } from "@storybook/react-vite";

import { AiAssistantDock } from "../../components/blocks/ai-assistant-dock";

const meta = {
  title: "Blocks/AiAssistantDock",
  component: AiAssistantDock,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AiAssistantDock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="min-h-[80dvh] bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[90dvh] bg-[radial-gradient(60rem_40rem_at_20%_25%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_65%),radial-gradient(50rem_34rem_at_85%_65%,color-mix(in_oklch,var(--accent)_14%,transparent),transparent_70%)]"
      />

      <div className="mx-auto max-w-screen-2xl px-4 pt-24">
        <div className="max-w-xl text-sm text-muted-foreground">
          El dock abre un Sheet con estilo tipo widget (chat). Este story fuerza el Sheet abierto.
        </div>
      </div>

      <div className="h-[80dvh]" />

      <AiAssistantDock defaultOpen />
    </div>
  ),
};
