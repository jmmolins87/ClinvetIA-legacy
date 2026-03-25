import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

const meta = {
  title: "UI/Feedback/Sonner",
  component: Toaster,
  tags: ["autodocs"],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Toasts: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Toaster />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => toast.success("Success toast")}>Success</Button>
        <Button variant="secondary" onClick={() => toast.info("Info toast")}>
          Info
        </Button>
        <Button variant="secondary" onClick={() => toast.warning("Warning toast")}>
          Warning
        </Button>
        <Button variant="destructive" onClick={() => toast.error("Error toast")}>
          Error
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.loading("Loading toast")}
        >
          Loading
        </Button>
      </div>
    </div>
  ),
};
