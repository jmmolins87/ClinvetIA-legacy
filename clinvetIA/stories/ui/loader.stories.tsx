import type { Meta, StoryObj } from "@storybook/react-vite";

import { Loader } from "../../components/loader";

const meta = {
  title: "UI/Loaders/Loader",
  component: Loader,
  tags: ["autodocs"],
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="relative h-[520px] w-full overflow-auto bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-4 text-sm text-foreground/80">
        <p>
          This story keeps the page scrollable while showing the loader as a window.
        </p>
        {Array.from({ length: 20 }).map((_, i) => (
          <p key={i}>
            Scroll me: placeholder content line {i + 1}.
          </p>
        ))}
      </div>
      <Loader mode="contained" />
    </div>
  ),
};
