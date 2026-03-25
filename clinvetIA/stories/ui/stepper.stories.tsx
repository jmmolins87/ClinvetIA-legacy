import type { Meta, StoryObj } from "@storybook/react-vite";

import { Stepper } from "../../components/ui/stepper";

const meta = {
  title: "UI/Navigation/Stepper",
  component: Stepper,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    steps: [
      {
        key: "1",
        icon: "MessageCircle",
        title: "Owner messages",
        description: "24/7 intake and triage.",
      },
      {
        key: "2",
        icon: "Brain",
        title: "System verifies",
        description: "Understands intent and checks availability.",
      },
      {
        key: "3",
        icon: "CalendarCheck",
        title: "Suggests slots",
        description: "Options based on visit type.",
      },
      {
        key: "4",
        icon: "BellRing",
        title: "Confirms and reminds",
        description: "Booking + reminders.",
      },
    ],
  },
};

export const Cards: Story = {
  args: {
    variant: "cards",
    steps: [
      {
        key: "1",
        icon: "MessageCircle",
        title: "Owner messages",
        description: "24/7 intake and triage.",
      },
      {
        key: "2",
        icon: "Brain",
        title: "System verifies",
        description: "Understands intent and checks availability.",
      },
      {
        key: "3",
        icon: "CalendarCheck",
        title: "Suggests slots",
        description: "Options based on visit type.",
      },
      {
        key: "4",
        icon: "BellRing",
        title: "Confirms and reminds",
        description: "Booking + reminders.",
      },
    ],
  },
};
